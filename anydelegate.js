
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>


<script type='text/javascript'>


(function($) {

/*
apply to a selector to handle app events.
additionally, will apply some conditional form logic.
*/

	$.widget("ui.anydelegate",{
		options : {
//			trackFormEvents : true, //set to false to turn off the form event actions (panel code et all)
			trackEdits : false, //boolean.  if true, as an input/select is changed, an 'edited' class is added to the input.
/* the following options are only applicable if trackEdits is enabled */
			trackSelector : null, //allows for delegation to occur on an element encompasing several forms, but for tracking to be applied to each individual form.
			masterSaveSelector : "[data-app-role='masterSaveButton']" //if applying track edits to a subset, this can be used to update a master button (X total changes within all forms).
			},
		_supportedEvents : ["click","change","focus","blur","submit","keyup"], //a function so they're easily 
		_init : function(){
//			dump("BEGIN anydelegate");
			var
				self = this,
				$t = self.element; //this is the targeted element (ex: $('#bob').anydelegate() then $t is bob)

//don't want to double-delegate. make sure no parent already has delegation run. a class is used as it's more efficient and can be trusted because it's added programatically.
			if($t.hasClass('eventDelegation') || $t.closest('.eventDelegation').length >= 1)	{
//				dump("anydelegate was run on an element that already (or one of it's parents) has events delegated. DELEGATION SKIPPED.");
				}
			else	{
				$t.addClass('eventDelegation'); //this class is used both to determine if events have already been added AND for some form actions to use in closest.
//make sure there are no children w/ delegated events.
				$('.eventDelegation',$t).each(function(){
					$(this).anydelegate('destroy');
					});
				for(var i = 0; i < self._supportedEvents.length; i += 1)	{
					$t.on(self._supportedEvents[i]+".app","[data-app-"+self._supportedEvents[i]+"], [data-input-"+self._supportedEvents[i]+"]",function(e,p){
//						dump(" -> delegated "+self._supportedEvents[i]+" triggered");
						return self._executeEvent($(e.currentTarget),$.extend(p,e));
						});
					}
				}


//go through and trigger the form based events, so that if any content/classes should be on, they are.
//do this before edit tracking is added so the edited class is not added.
//this block is executed outside the  if/else above so that if anydelegate has already been added to a parent, new content still gets default actions.
				self.triggerFormEvents();



//outside the app event delegation check for backwards compatiblity.
//the track edit delegation is removed and added in case it's run more than once, so that each edit isn't double-counted.
			if(self.options.trackEdits)	{
				if(self.options.trackSelector)	{
//					dump(" -> TrackSelector IS enabled");
					$(self.options.trackSelector,$t).each(function(){
						self._applyTracking4Edits($(this));
						})
					}
				else	{
					self._applyTracking4Edits($t);
					}
				this.updateChangeCounts(); //handles defaults, like hiding the changes-container elements
				}
			}, //_init

//what is triggered when an event occurs.
//$CT = $(e.currentTarget)
//ep = event + parameters (params may get added if the event is triggered programatically)
		_executeEvent : function($CT,ep)	{
//			dump(" -> ui.anydelegate._executeEvent being run");
			ep = ep || {};
			var r = true; //what is returned.
			ep.normalizedType = this._normalizeEventType(ep.type);
			if($CT && $CT instanceof jQuery)	{
				if($CT.attr('data-input-'+ep.normalizedType))	{
					r = this._handleFormEvents($CT,ep);
					}
				
				if($CT.attr('data-app-'+ep.normalizedType))	{
					r = this._handleAppEvents($CT,ep);
					}
				
				}
			else	{
				$('#globalMessaging').anymessage({'message':"In ui.anydelegate._executeEvent, $CT is empty or not a valid jquery instance [isValid: "+($CT instanceof jQuery)+"] or p.type ["+ep.normalizedType+"] is not set.",'gMessage':true})
				}
//			dump("_executeEvent r: "+r);
			return r;
			},

		_formEventActions : {
//used w/ keyup to modify the value of the input. ex: all uppercase. input-format accepts a comma separated list of values.
//$CT = Current Target.
			"input-format" : function($CT)	{
				if($CT.data('input-format').indexOf('uppercase') > -1)	{
					$CT.val($CT.val().toUpperCase());
					}
				
				if($CT.data('input-format').indexOf('alphanumeric') > -1)	{
					$CT.val($CT.val().toString().replace(/\W+/g,""));
					}
//an input can not be both alphanumeric AND numeric.
				else if($CT.data('input-format').indexOf('numeric') > -1)	{
					$CT.val($CT.val().replace(/[^0-9]+/g, ''));
					}							
				else if($CT.data('input-format').indexOf('decimal') > -1)	{
					$CT.val($CT.val().replace(/[^0-9\.]+/g, ''));
					}							
				
				if($CT.data('input-format').indexOf('pid') > -1)	{
					$CT.val($CT.val().replace(/[^\w\-_]+/, '','g'));
					}
				},
//allows an input to specify a button to get triggered if 'enter' is pushed while the input is in focus.
			"trigger-button-id" : function($CT,$t,ep)	{
				if(ep.keyCode==13){$CT.closest(".eventDelegation").find("button[data-button-id='"+$CT.attr('data-trigger-button-id')+"']").first().trigger('click')}
				},
			
//allows one form input to set the value of another.
			"set-value-selector" : function($CT)	{
				$($CT.data('set-value-selector'),$CT.closest('form')).val($CT.is('select') ? $("option:selected",$CT).data('set-value') : $CT.data('set-value')).trigger('keyup.trackform').trigger('change.trackform');
				},

//will hide the matching selectors. (hide-selector='.bob' will hide all class='bob' elements.
			"hide-selector" : function($CT,$t)	{
				if($($CT.attr('data-hide-selector'),$t).is(':hidden'))	{}
				else	{
					$($CT.attr('data-hide-selector'),$t).slideUp();
					}
				},

//will show the matching selectors. (show-selector='.bob' will show all class='bob' elements.
			"show-selector" : function($CT,$t)	{
				if($($CT.attr('data-show-selector'),$t).is(':visible'))	{}
				else	{
					$($CT.attr('data-show-selector'),$t).slideDown();
					}
				},
			
///			"toggle-selector" : function($CT,$t)	{
				
//				},

			"checked-classes" : function($CT,$t)	{
				$t.removeClass($CT.data('check-selectors'));
				$CT.is(':checked') ? $t.addClass($CT.data('checked-classes')) : $t.removeClass($CT.data('checked-classes'));
				},

			"unchecked-classes" : function($CT,$t)	{
				$t.removeClass($CT.data('check-selectors'));
				!$CT.is(':checked') ? $t.addClass($CT.data('unchecked-classes')) : $t.removeClass($CT.data('unchecked-classes'));
				},

//allows for a specific panel (or sets of panels) to be turned on/off based on selection. commonly used on a select list, but not limited to that.
//provides more control that trying to accomplish the same thing with the show/hide-selectors.
			"panel-selector" : function($CT)	{
				$($CT.data('panel-selector'),$CT.closest('form')).hide(); //hide all panels w/ matching selector.
				
				if($CT.is(':checkbox') && !$CT.is(':checked'))	{} //this is an unchecked checkbox. do nothing.
				else	{
					var panelList = $CT.is('select') ? $("option:selected",$CT).data('show-panel') : $CT.data('show-panel');
					if(panelList)	{
						if(panelList.indexOf(','))	{panels = panelList.split(',')}
						else {panels.push(panelList)};
						
						for(var i = 0; i < panels.length; i += 1)	{
							$("[data-panel-id='"+panels[i]+"']",$CT.closest('form')).show(); //panel defined and it exists. show it.
							}
						}
					else	{} //no panel was defined. this is an acceptable case.
					}
				}
			},

//useful if the DOM is updated w/ a new template/content and the defaults for form events need to be triggered.
		triggerFormEvents : function()	{
			var self = this, $t = self.element, L = self._supportedEvents.length;
			for(var i = 0; i < L; i += 1)	{
				$("[data-input-"+self._supportedEvents[i]+"]",$t).each(function(index){
//					dump(index+") for form events.");
					var $i = $(this);
					if($i.is('select'))	{
						$('option:selected',$i).trigger(self._supportedEvents[i]+'.app');
						}
					else if($i.is(':checkbox'))	{
						$i.trigger(self._supportedEvents[i]+'.app');
						}
					else if($i.is(':radio'))	{
						if($i.is(':checked'))	{
							$i.trigger(self._supportedEvents[i]+'.app');
							}
						else	{} //is a radio but isn't selected.
						}
					else	{
						$i.trigger(self._supportedEvents[i]+'.app');
						}
					});
				}
			},

//a method that can be triggered by $('selector').anydelegate('updateChangeCounts')
		updateChangeCounts : function()	{
//			dump(" -> anydelegate('updateChangeCounts') has been run");
			var self = this;
			if(self.options.trackSelector)	{
				$(self.options.trackSelector,self.element).each(function(){
					var $ele = $(this);
//if a changes container has been specified, update with the number of edits or hide if there are no edits.
					if($ele.data('changes-container'))	{
						if($('.edited',$ele).length)	{
							$("[data-anydelegate-changes='"+$ele.data('changes-container')+"']",self.element).show().find('.numChanges').text($('.edited',$ele).length)
							}
						else	{
							$("[data-anydelegate-changes='"+$ele.data('changes-container')+"']",self.element).hide();
							}
						
						}
					self._updateSaveButtonInContext($ele,"[data-app-role='saveButton']");
					})
				}
			else	{
				self._updateSaveButtonInContext(this.element,"[data-app-role='saveButton']");
				}
			if(this.options.masterSaveSelector)	{
				self._updateSaveButtonInContext(this.element,"[data-app-role='masterSaveButton']");
				}
			},

/*
pass in an event name and a function and it will be added as an eventAction.
		addFormEventAction : function(name,eventActionFunction){},

*/

//used to update the save buttons, both the master and the individuals.
		_updateSaveButtonInContext : function($context,selector)	{
//			dump(" -> running anydelegate._handleSaveButtonByEditedClass.");
//run over EACH button individually.  some may have had button() run on them, some may not.
			$(selector,$context).each(function(){
				var $button = $(this);
				if($('.edited',$context).length)	{
					$('.numChanges',$button).text($('.edited',$context).length);
					$button.addClass('ui-state-highlight');
					if($button.hasClass('ui-button'))	{
						$button.button("enable");
						}
					else	{
						$button.attr('disabled','').removeAttr('disabled');
						}
					}
				else	{
					$('.numChanges',$button).text("");
					$button.removeClass('ui-state-highlight');
					if($button.hasClass('ui-button'))	{
						$button.button("disable")
						}
					else	{
						$button.attr('disabled','disabled');
						}
					}

				});
			},
		
		_applyTracking4Edits : function($context)	{
			var self = this;
			$context.off('change.trackform').on('change.trackform',"select, :radio, :checkbox",function(event)	{
				var $input = $(this);
				if($input.hasClass('skipTrack'))	{} //if skipTrack is set, do nothing.
				else if($input.is(':checkbox'))	{
					$input.toggleClass('edited');
					self.updateChangeCounts($context);
					}
				else	{
					if($input.is(':radio'))	{
						$("[name='"+$input.attr('name')+"']",$input.closest('form')).removeClass('edited'); //remove edited class from the other radio buttons in this group.
						}
					$input.addClass('edited');
					self.updateChangeCounts($context);
					}
				});

// mouseup event present because a right click of 'paste' does not trigger keyup.
			$context.off('keyup.trackform').on('keyup.trackform mouseup.trackform',"input, textarea",function(event){
				var $input = $(this);
				if($input.hasClass('skipTrack')){} //allows for a field to be skipped.
				else if($input.is(':checkbox') || $input.is(':radio'))	{
					//handled in it's own delegation above. Here because they 'could' be triggered by a space bar.
					}
//only add the edited class if the value has changed.
				else if($input.prop("defaultValue") != $input.val())	{
					$input.addClass('edited');
					self.updateChangeCounts($context);
					}
				else	{
					//well... something happened.  verify change counts are correct. 
					self.updateChangeCounts($context);
					}
				});

			},
		
		_handleFormEvents : function($CT,ep)	{
//			dump("BEGIN _handleFormEvents");
			//for each event action, determine if the element should trigger it and, if so, trigger it.
			for(index in this._formEventActions)	{
				if($CT.data(index))	{this._formEventActions[index]($CT,this.element,ep);}
				}
			},
//passing in a context allows this reset to impact just a portion of the delegated. useful in conjuction w/ trackSelector
		resetTracking : function($context)	{
			$context = $context || this.element;
			$('.edited',$context).removeClass('edited');
			this._updateSaveButtonInContext($context,"[data-app-role='saveButton']");
			this._updateSaveButtonInContext(this.element,"[data-app-role='masterSaveButton']"); //intentionaly not using $context because master could be outside it. This way the master buttons count still updates.
			},

		_handleAppEvents : function($CT,ep)	{
//by now, $CT has already been verified as a valid jquery object and that is has some data-app-EVENTTYPE on it.
			ep = ep || {};
			var r, actionsArray = $CT.data('app-'+ep.normalizedType).split(","), L = actionsArray.length; // ex: admin|something or admin|something, admin|something_else

			for(var i = 0; i < L; i += 1)	{
				var	AEF = $.trim(actionsArray[i]).split('|'); //Action Extension Function.  [0] is extension. [1] is Function.
//				dump(i+") AEF: "); dump(AEF);
				if(AEF[0] && AEF[1])	{
					if(adminApp.ext[AEF[0]] && adminApp.ext[AEF[0]].e[AEF[1]] && typeof adminApp.ext[AEF[0]].e[AEF[1]] === 'function')	{
						//execute the app event.
						r = adminApp.ext[AEF[0]].e[AEF[1]]($CT,ep);
						}
					else	{
						$('#globalMessaging').anymessage({'message':"In ui.anydelegate._handleAppEvents, extension ["+AEF[0]+"] and function["+AEF[1]+"] both passed, but the function does not exist within that extension.",'gMessage':true})
						}
					}
				else	{
					$('#globalMessaging').anymessage({'message':"In ui.anydelegate._handleAppEvents, data-app-"+ep.normalizedType+" ["+$CT.attr('data-app-'+ep.normalizedType)+"] is invalid. Unable to ascertain Extension and/or Function",'gMessage':true});
					}				
				}
			return r;
			},


/*
want to avoid double-delegation. so mutation watches to see if this element is moved.
suppose events were delegated but not applied because the parent already had delegated events, then this element moved into a new parent (a sticky tab, perhaps). suddenly, delegation is gone.
 -> in this case, apply the events.
alternatively, this could get moved into another parent that already has event delegation on it.
 -> in this case, remove the events.

In both cases, keep watching for further changes.

		_watchMutation : function()	{
			
			},
*/
//The actual event type and the name used on the dom (focus, blur, etc) do not always match. Plus, I have a sneaking feeling we'll end up with differences between browsers.
//This function can be used to regularize the event type. Wherever possible, we'll map to the jquery event type name.
		_normalizeEventType : function(type)	{
			var r = type;
			if(type == 'focusin')	{
				r = 'focus';
				}
			else if(type == 'focusout')	{
				r = 'blur';
				}
			return r;
			},

//clear the message entirely. run after a close. removes element from DOM.
		destroy : function(){
			//remove all the delegated events!!! leave the content alone.
			this.element.off('change.trackform').off('keyup.trackform');
			var supportedEvents = new Array("click","change","focus","blur","submit","keyup");
			for(var i = 0; i < supportedEvents.length; i += 1)	{
				this.element.off(supportedEvents[i]+".app");
				}
			this.element.removeClass('eventDelegation').addClass('delegationRemoved'); //here for troubleshooting purposes.
			}
		}); // create the widget
})(jQuery); 








function handleFormConditionalDelegation($container)	{
//events don't seem to be bubbling like i expected. so within each event handler, move up the dom to the target element (this is the reason for the 'closest')
				$container.on('keyup',function(e)	{
//					app.u.dump(" -> e.target.nodeName.toLowerCase(): "+e.target.nodeName.toLowerCase());
					if(e.target.nodeName.toLowerCase() == 'input'){
						var $input = $(e.target);
						
						if($input.data('input-format'))	{

							if($input.data('input-format').indexOf('uppercase') > -1)	{
								$input.val($input.val().toUpperCase());
								}
							
							if($input.data('input-format').indexOf('alphanumeric') > -1)	{
								$input.val($input.val().replace(/\W/, '','g'));
								}							
							
							if($input.data('input-format').indexOf('pid') > -1)	{
								$input.val($input.val().replace(/[^\w\-_]+/, '','g'));
								}
							
							}
						}
					});
				
				$container.on('click','[data-show-selector]',function(e)	{
					var $ele = $(e.target);
					if($ele.attr('data-show-selector'))	{}
					else	{
						$ele = $ele.closest("[data-show-selector]");
						}
//only animate if it is hidden.
					if($($ele.attr('data-show-selector'),$container).is(':visible'))	{}
					else	{
						$($ele.attr('data-show-selector'),$container).slideDown();
						}
					});
				$container.on('click','[data-toggle-class]',function(e)	{
					var $ele = $(e.target);
					if($ele.attr('data-toggle-class'))	{}
					else	{
						$ele = $ele.closest("[data-toggle-class]");
						}
					$container.toggleClass($ele.attr('data-toggle-class'));
					});
				$container.on('click','[data-hide-selector]',function(e)	{
					var $ele = $(e.target);
					if($ele.attr('data-hide-selector'))	{}
					else	{
						$ele = $ele.closest("[data-hide-selector]");
						}
//only hide if not already hidden.
					if($($ele.attr('data-show-selector'),$container).is(':visible'))	{$($ele.attr('data-show-selector'),$container).slideUp();}
					});
				
				$container.on('click','[data-toggle]',function(e)	{
					var $ele = $(e.target);
					
					
					if($ele.is(':checked'))	{
						$($ele.attr('data-show-selector'),$container).slideDown();
						}
					else if(!$ele.is(':checked') && $($ele.attr('data-show-selector'),$container).is(':visible'))	{
						$($ele.attr('data-hide-selector'),$container).slideUp();
						}
					else	{
						//to get here, checkbox is checked and selector is already visible OR unchecked and already hidden.
						}
					});
// !!! this should have a selector in the scond param but needs testing against existing use cases (supply chain, ebay ,etc)
// aaarrrgghh.  I hate being rushed. this'll need to be rewritten to be more efficient when time permits.
				$container.on('click',function(e){
					var	$ele = $(e.target)
//					app.u.dump(" -> e.target.nodeName.toLowerCase(): "+e.target.nodeName.toLowerCase());
					if($ele.is(':radio') || $ele.is(':checkbox'))	{

						$($ele.data('panel-selector'),$container).hide(); //hide all panels w/ matching selector.
						if(!$ele.data('show-panel'))	{} //no panel defined. do nada
						else if($ele.is(':checkbox') && !$ele.is(':checked'))	{} //is an unchecked checkbox. do nada
						else if($ele.data('show-panel'))	{
							var panels = new Array();
							if($ele.data('show-panel').indexOf(','))	{panels = $ele.data('show-panel').split(',')}
							else {panels.push($ele.data('show-panel'))};
							for(var i = 0; i < panels.length; i += 1)	{
								$("[data-panel-id='"+panels[i]+"']",$container).show(); //panel defined and it exists. show it.
								}
							}
						
						}
					else	{
						if(e.target.nodeName.toLowerCase() == 'option' || e.target.nodeName.toLowerCase() == 'select'){
//						app.u.dump('is option or select');
//FF registers a click on the option. Chrome on the select.
//to be consistent, put select into focus.						
						if(e.target.nodeName.toLowerCase() == 'option'){
							$ele = $ele.closest('select');
									var panels = new Array();
									if($option.data('show-panel').indexOf(','))	{panels = $option.data('show-panel').split(',')}
									else {panels.push($option.data('show-panel'))};
									for(var i = 0; i < panels.length; i += 1)	{
										$("[data-panel-id='"+panels[i]+"']",$container).show(); //panel defined and it exists. show it.
										}
							}
//						app.u.dump(" -> $ele.is('select'): "+$ele.is('select'));
//						app.u.dump(" -> $ele.data('panel-selector'): "+$ele.data('panel-selector'));
/*
panel-selector:
on a select, set data-panel-selector=".someClass"
on each option, set data-show-panel=""
on each panel, which MUST be within the same form, set data-panel-id="" where the value matches the data-show-panel set in the option.
so when the option with data-show-panel="supplierShippingConnectorGeneric" is selected, the panel with data-panel-id="supplierShippingConnectorGeneric" is displayed
and all .someClass are hidden (value of data-panel-selector)

*/
							if($ele.data('panel-selector'))    {
								
					
								$($ele.data('panel-selector'),$container).hide(); //hide all panels w/ matching selector.
								var $option = $('option:selected',$ele);
								if(!$option.data('show-panel'))	{} //no panel defined. do nada
								else if($option.data('show-panel'))	{
									var panels = new Array();
									if($option.data('show-panel').indexOf(','))	{panels = $option.data('show-panel').split(',')}
									else {panels.push($option.data('show-panel'))};
									for(var i = 0; i < panels.length; i += 1)	{
										$("[data-panel-id='"+panels[i]+"']",$container).show(); //panel defined and it exists. show it.
										}
									}
								else	{
									$container.anymessage({'message':"The option selected has a panel defined ["+$option.data('show-panel')+"], but none exists within the form specified.",'gMessage':true}); //panel defined but does not exist. throw error.
									}
								}
							}
						}
					});				
//after adding the listeners, need to trigger some clicks.

//trigger the hide/show panel on select options.
				$("select[data-panel-selector]",$container).each(function(){
					if($('option:selected',$(this)).data('show-panel'))	{
						$('option:selected',$(this)).trigger('click');
						}
					});

				$container.on('change',':input',function(e){
					var $ele = $(e.target);
					var $option = $(":selected",$ele);
					if($option.data('change-input'))	{
						app.u.dump(" -> $option.data('change-newval'): "+$option.data('change-newval'));
						$("[name='"+app.u.jqSelector('',$option.data('change-input'))+"']",$container).val($option.data('change-newval'))
						}
					});

				}


</script>



</head>

<body>
</body>
</html>
