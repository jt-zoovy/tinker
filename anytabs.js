//http://net.tutsplus.com/tutorials/javascript-ajax/coding-your-first-jquery-ui-plugin/
(function($) {
	$.widget("ui.anytabs",{
		options : {},

		_init : function(){
			var self = this,
			o = self.options, //shortcut
			$t = self.element; //this is the targeted element (ex: $('#bob').anytabs() then $t is bob)

			if($t.attr('data-widget-anytabs'))	{
				app.u.dump("data-widget-anytabs -> already enabled.");
				} //element has already been set as tabs.
			else	{
				$t.attr('data-widget-anytabs',true)
				$t.addClass('ui-tabs ui-widget ui-widget-anytabs')
				self.tabs = $("ul",$t).first();
//style and move tabs into container.
				self._handleContent();
				self._addClasses2Content();
				
//style and add click events to tabs.
				self._addClasses2Tabs();
				self._addEvent2Tabs();
//make a tab visible/active.
				self._handleDefaultTab();
				}
			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			},

		_activateFirstTab : function()	{
			this.tabs.children().first().addClass('ui-state-active ui-tabs-active');
			this.tabContent.children().first().css('display','block');
			},

		_handleDefaultTab : function()	{
			var anchor = document.location.hash;
//if no anchor is set, activate the default.
			if(anchor)	{
				var foundMatch = false;
				$('a',this.element).each(function(){
					if($(this).attr('href') == anchor)	{$(this).trigger('click'); foundMatch = true; return false;} //the return false breaks out of the loop.
					});
//if href value matches the anchor, trigger the default tab.
				if(foundMatch)	{}
				else	{this._activateFirstTab();}
				}
			else	{
				this._activateFirstTab();
				}
			},

		_addEvent2Tabs : function()	{
			var self = this;
// *** 201336 -> tab clicks now use delegated events. more efficient.
			this.tabs.on('click','a',function(event){
				event.preventDefault();
				self.reveal($(this).parent());
//				if($(this).data('app-click'))	{
//					app.u.executeEvent($(this),{'type':'click'});
//					}
				return false;
				});
			},

		_addClasses2Tabs : function()	{
			this.tabs.addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix').css({'padding-left':'0px'});
			this.tabs.find('a').addClass('ui-tabs-anchor').attr('role','presentation');
// * 201336 -> wanted a data reference on the li of the tab that was consistent. can be used to show or hide tab, if needed.
			this.tabs.find('li').each(function(){
				$(this).addClass('ui-state-default ui-corner-top');
				$(this).attr('data-anytabs-tab',$(this).find('a').first().attr('href').substr(1));
				});
			},
//create a container div and add each content panel to it.
		_handleContent : function()	{
			var $t = this.element,
			self = this;
			
			self.tabContent = $("<div \/>").addClass('ui-widget ui-widget-content ui-corner-bottom ui-corner-tr');
			$t.append(self.tabContent);
			$("[data-anytab-content]",$t).each(function(){
				self.tabContent.append($(this));
				});
			},

		_addClasses2Content : function()	{
			$("[data-anytab-content]",this.element).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").css('display','none');
			},

		reveal : function($tab)	{
			var $newTab = false;
			//method accepts string or jquery object as the trigger.
			if(typeof $tab == 'string')	{
				var $href = $("a[href='"+($tab.charAt(0) == '#' ? $tab : '#'+$tab)+"']",this.tabs);
				if($href.length)	{
					$newTab = $href.parent();
					delete $href;
					}
				else	{}
				}
			else if($tab instanceof jQuery)	{
				$newTab = $tab;
				}
			else	{
				
				}
			
			if($newTab)	{
				var dac = $newTab.find('a').attr('href').substring(1); //data-anytab-content
				this.tabs.find('.ui-state-active').removeClass('ui-state-active ui-tabs-active');
				$newTab.addClass('ui-state-active ui-tabs-active');

				this.tabContent.find('.ui-tabs-panel').hide();
				$("[data-anytab-content='"+dac+"']",this.tabContent).show();
				}
			else	{} //unknownn type for $tab far
			},

//clear the message entirely. run after a close. removes element from DOM.
		destroy : function(){
			this.element.intervaledEmpty(500,true);
			this.element.removeClass("ui-tabs");
			this.element.removeClass("ui-widget");
			this.element.removeClass("ui-widget-anytabs");
			this.element.data("widget-anytabs","");
			this.element.attr("data-widget-anytabs","").removeAttr('data-widget-anytabs');
			}
		}); // create the widget
})(jQuery); 