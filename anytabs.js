//http://net.tutsplus.com/tutorials/javascript-ajax/coding-your-first-jquery-ui-plugin/
(function($) {
	$.widget("ui.anytabs",{
		options : {},

		_init : function(){
			var self = this,
			o = self.options, //shortcut
			$t = self.element; //this is the targeted element (ex: $('#bob').anymessage() then $t is bob)
			
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
			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			},


		_handleDefaultTab : function()	{
//			var anchor = document.location.hash.substring(1);
//			console.log('anchor: '+anchor);
			this.tabs.children().first().addClass('ui-state-active ui-tabs-active');
			this.tabContent.children().first().css('display','block');
			},

		_addEvent2Tabs : function()	{
			var self = this;
			this.tabs.find('li').each(function(){
				$(this).off('click.anytab').on('click.anytab',function(){
					self.reveal($(this));
					});
				});
			},

		_addClasses2Tabs : function()	{
			this.tabs.addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix').css({'padding-left':'0px'});
			this.tabs.find('a').addClass('ui-tabs-anchor').attr('role','presentation');
			this.tabs.find('li').addClass('ui-state-default ui-corner-top');
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
			var dac = $tab.find('a').attr('href').substring(1); //data-anytab-content
			
			this.tabs.find('.ui-state-active').removeClass('ui-state-active ui-tabs-active');
			$tab.addClass('ui-state-active ui-tabs-active');
			
			this.tabContent.find('.ui-tabs-panel').hide();
			$("[data-anytab-content='"+dac+"']",this.tabContent).show();
			},

//clear the message entirely. run after a close. removes element from DOM.
		destroy : function(){
			this.element.empty().remove();
			}
		}); // create the widget
})(jQuery); 