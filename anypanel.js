//http://net.tutsplus.com/tutorials/javascript-ajax/coding-your-first-jquery-ui-plugin/
(function($) {
	$.widget("ui.anypanel",{
		options : {
			state : 'open', //open and close are acceptable values. sets panel contents to open or closed. Any value other than 'close' triggers open.
			templateID : null, //what any commerce template to use to populate the panel.
			data : {}, //what data to use to translate the panel.
			call : null, //
			q : 'mutable', //which q to use.
			extension : '',
			name : '',
			persist : false, //if set to true and name AND extension set, will save to localStorage using devicePreferences
			settingsMenu : {}
			},
		_init : function(){
			var self = this,
			o = self.options,
			$t = self.element;
			if($t.data('isanypanel'))	{} //already a panel, do nothing.
			else	{
				$t.addClass('ui-widget').data('isanypanel',true).css('position','relative');
				var $header = $t.children(":first"),
				buttonStyles = {'float':'right','width':'20px','height':'20px','padding':0,'margin':'2px'};
				$header.css({'fontSize':'.85em','lineHeight':'1.6em','textIndent':'.75em'})
				$header.wrap($("<div \/>").addClass('ui-widget-header ui-accordion-header ui-corner-top ')).css({'padding':'0px;','minHeight':'24px'});
				
				$header.append($("<button \/>").hide().attr('data-btn-action','settingsMenu').css(buttonStyles).text('Settings')
					.button({text: false,icons : {primary : 'ui-icon-power'}})
					.off('click.settingsMenu').on('click.settingsMenu',function(){
						var $ul = $("[data-ui-role='settingsMenu']",$t).toggle();

//this will make it so any click outsite the menu closes the menu. the one() means it only gets triggered once.
//it's inside the click handler, so it'll get added each time the settings are opened.
						if($ul.is(":visible"))	{setTimeout(function(){$(document).one("click", function() {$ul.hide();});},1000);}
						
						})); //the settings button is always generated, but only toggled on when necessary.
				if(o.settingsMenu)	{this.buildSettingsMenu()}
				
				$header.append($("<button \/>").attr('data-btn-action','toggle').css(buttonStyles).text('Open/close panel').button({text: false}).on('click.panelViewState',function(){self.toggle()})); //settings button
				(o.state) === 'close' ? this.close() : this.open(); //set the panel to open or close. will open default or value passed in options.
				
				
				var $content = $t.children(":nth-child(2)");
				if($content.length)	{}
				else	{$content = $("<div \/>"); $content.appendTo($t);}
				$content.addClass('ui-widget-content ui-corner-bottom dragbox-content').css('borderTop','0'); //content area.
//				if(this.data && this.templateID)	{transmogrify}
//				else if(this.call && this.tempateID)	{}		
//				else if(this.tempateID)	{$content.append(app.renderFunctions.createTemplateInstance('',templateID))} !!! finish and test.
//				else	{} //do nothing. no content specified. this is perfectly valid, data may already have been on dom.
				}
			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			switch (option)	{
				case 'state':
					(value === 'close') ? this.close() : this.open(); //the open/close function will change the options.state val as well.
					break;

				case 'settingsMenu':
					$.extend(this.options.menu,value); //add the new menu to the existing menu object. will overwrite if one already exists.
					this.destroySettingsMenu();
					this.buildSettingsMenu();
					break;
				
				default:
					console.log("Unrecognized option passed into anypanel via setOption");
					console.log(" -> option: "+option);
					break;
				}
			},
		
		close : function(){
			$("[data-btn-action='toggle']",this.element).button({icons : {primary : 'ui-icon-triangle-1-s'}});
			$('.dragbox-content',this.element).hide();
			$('.ui-widget-header',this.element).addClass('ui-corner-bottom');
			this.options.state = 'close';
			},
		open : function(){
			$("[data-btn-action='toggle']",this.element).button({icons : {primary : 'ui-icon-triangle-1-n'}});
			$('.dragbox-content',this.element).show();
			$('.ui-widget-header',this.element).removeClass('ui-corner-bottom');
			this.options.state = 'open'
			},
		toggle : function(){
			if(this.options.state == 'open')	{this.close()}
			else	{this.open()}
			},

		destroySettingsMenu : function()	{
			$("[data-ui-role='settingsMenu']",this.element).empty().remove();
			},
		
		buildSettingsMenu : function()	{
			var $ul = $("<ul \/>"),
			sm = this.options.settingsMenu;
			
			$ul.attr('data-ui-role','settingsMenu').hide().css({'position':'absolute','right':0,'zIndex':10000});
			for(index in sm)	{
				$("<li \/>").text(index).on('click',sm[index]).appendTo($ul);
				}
			if($ul.children().length)	{
				$ul.menu();
				$("[data-btn-action='settingsMenu']",this.element).show().closest('.ui-widget-header').after($ul);
				}
			else	{} //no listitems. do nothing.
			},
		destroy : function(){
			this.destroySettingsMenu();
			this.element.empty().remove();
			}
		}); // create the widget
})(jQuery); 