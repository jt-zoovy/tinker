
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>


<script type='text/javascript'>


(function($) {
	$.widget("ui.anymessage",{
		options : {
			trackEdits : false, //a string for output. if set, will ignore any _msgs or _err orr @issues in the 'options' object (passed by a request response)
			formConditionals : false //set to true to throw a generic message. Will include extra error details
			},

		_init : function(){
//			app.u.dump("BEGIN anymessage");
			var self = this,
			o = self.options, //shortcut
			$t = self.element; //this is the targeted element (ex: $('#bob').anymessage() then $t is bob)

			}, //_init

		_getCloseButton : function()	{
			var $t = this.element;
			return $("<button \/>")
				.text('close message').css({'float':'right','marginLeft':'5px','marginBottom':'5px'})
				.button({icons: {primary: "ui-icon-circle-close"},text: false})
				.on('click.closeMsg',function(event){event.preventDefault(); $t.anymessage('close',$(this).closest('.ui-widget-anymessage'))});
			},

//adds the outer 'container' div around the message.
		_getContainer : function()	{
			return $("<div \/>").addClass("ui-widget ui-widget-content ui-widget-anymessage ui-corner-all marginBottom").css({'padding':'5px','min-height':'28px'}).addClass(this.options.containerClass);
			},


		_getFormattedMessage : function(instance)	{
//			app.u.dump(" -> _getFormattedMessage executed");
			var o = this.options, //shortcut
			msg = o.message || o, //shortcut to the message itself. if message blank, options are used, which may contain the response data errors (_msgs, err etc)
			msgDetails = "", //used for iseerr (server side error) and ise/no response
			$r, //what is returned.
			amcss = {'margin':'0','paddingBottom':'5px'} //anyMessageCSS - what's applied to P (or each P in the case of _msgs)
			
			
			if(!msg)	{
//				app.u.dump(" -> msg is blank. could be that message is being handled as a method.");
				//no message passed. is ok because messages 'could' get handled as a method.
				}
			else if(typeof msg == 'string')	{
//				app.u.dump(" -> msg is string: "+msg);
				$r = $("<p \/>").addClass('anyMessage').css(amcss).html(msg);
				}
			else if(typeof msg == 'object')	{
//				app.u.dump(" -> msg type is object."); app.u.dump(msg);
				if(msg._msgs)	{
				app.u.dump(" -> msg format is _msgs.");
					$r = $("<div \/>").css({'margin-left':'20px'}); //adds a left margin to make multiple messages all align.
					for(var i = 1; i <= msg['_msgs']; i += 1)	{
						$r.append($("<p \/>").addClass('anyMessage').css(amcss).addClass(msg['_msg_'+i+'_type']).text(msg['_msg_'+i+'_txt']+" ["+msg['_msg_'+i+'_id']+"]"));
						}
					}
				else if(msg.errid)	{
					app.u.dump(" -> msg type is err.");
					$r = $("<p \/>").addClass('anyMessage').css(amcss).addClass(msg.errtype).text(msg.errmsg+" ["+msg.errid+"]");
					
					if(msg.errtype == 'iseerr')	{
//					app.u.dump(" -> msg IS iseerr.");

					o.persistant = true; //iseErr should be persistant
					this.outputArr[instance].addClass('ui-state-error');
					$('button',this.outputArr[instance]).button('disable');

					this.outputArr[instance].addClass('ui-state-error');
						var msgDetails = "<ul>";
						msgDetails += "<li>errtype: iseerr<\/li>";
						msgDetails += "<li>errid: "+msg.errid+"<\/li>";
						msgDetails += "<li>errmsg: "+msg.errmsg+"<\/li>";
						msgDetails += "<li>uri: "+document.location+"<\/li>";
						msgDetails += "<li>domain: "+app.vars.domain+"<\/li>";
						msgDetails += "<li>release: "+app.model.version+"|"+app.vars.release+"<\/li>";
						msgDetails += "<\/ul>";
						$r.append(msgDetails);
						}
					}
//the validate order request returns a list of issues.
				else if(msg['@issues'])	{
					var L = msg['@issues'].length;
					console.dir("Got to @issues, length: "+L);
					$r = $("<div \/>").css({'margin-left':'20px'}); //adds a left margin to make multiple messages all align.
					for(var i = 0; i < L; i += 1)	{
						$r.append("<p>"+msg['@issues'][i][3]+"<\/p>");
						}
					}
				else	{
//					$r = $("<p \/>").addClass('anyMessage').text('An unknown error has occured');
					} //unknown data format
				}
			else	{
//				app.u.dump(" -> app.u.formatResponsethis.span 'else' hit. Should not have gotten to this point");
				$r = $("<p \/>").addClass('anyMessage').text('unknown error has occured'); //don't want to have our error handler generate an error on screen.
				}
			return $r;

			},

//an animated 'close'
		close : function($message){
			var $target;  //what is being closed. could be an individual message OR all messages.
			if($message)	{
				$target = $message;
				}
			else	{
				$target = $('.ui-widget-anymessage',this.element);
				}
			
			$message.each(function(){
//the message could be removed manually prior to the callback being executed, so don't animate if that's the case. (avoids popping issue)
//also, remove the message (this.output), not the target element, which may have a lot of other content.
				if($(this).is(':visible'))	{
					$(this).slideUp('fast');
					}
				else	{} //already closed. do nothing. could get here if message closed manually, before timeout runs.
				
				})
			},

//clear the message entirely. run after a close. removes element from DOM.
		destroy : function(){
			this.element.empty().remove();
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
