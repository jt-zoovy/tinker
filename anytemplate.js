//http://net.tutsplus.com/tutorials/javascript-ajax/coding-your-first-jquery-ui-plugin/
(function($) {
	$.widget("ui.anycontent",{
		options : {
			templateID : null, //The template to be used
			data : null, //The data used to populate the template
			showLoading : true, //if no data is passed and createTemplateInstance used, if true will execute show loading.
			showLoadingMessage : 'Fetching content...', //message passed into showLoading.
			dataAttribs : {} //will be used to set data attributes on the template [data- not data()].
			},

		_init : function(){
			var self = this,
			o = self.options, //shortcut
			$t = self.element; //this is the targeted element (ex: $('#bob').anymessage() then $t is bob)
// the 'or' portion will attemplate to add a template if the ID is on the DOM.
			if(o.templateID && (app.templates[templateID] || self._addNewTemplate(o.templateID)))	{
				self._anyContent;
				}
			else	{
				$t.anymessage({message:"Unable to translate. Template ["+o.templateID+"] not specified or not a app.templates[templateID] ["+typeof app.templates[templateID]+"] does not exist"});
				}
			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			},


		_anyContent : function()	{
			var o = this.options,
			r = true; // what is returned. false if not able to create template.
			
			if(o.templateID && o.data)	{
				this.element.append(app.renderFunctions.transmogrify(o.dataAttribs,o.templateID,o.data));
				if(o.showLoading)	{
					this.element.showLoading(o.showLoadingMessage);
					}
				}
//a templateID was specified, just add the instance. This likely means some process outside this plugin itself is handling translation.
			else if(o.templateID)	{
				this.element.append(app.renderFunctions.createTemplateInstance(o.templateID,o.dataAttribs));
				}
			else	{
				//should never get here. function won't be run if no templateID specified.
				r = false;
				}
			return r;
			},

		_addNewTemplate : function()	{
			var r = false; //what's returned. true if able to create template.
			var $tmp = $(app.u.jqSelector('#',templateID));
			if($tmp.length > 0)	{
				app.model.makeTemplate($tmp,templateID);
				r = true;
				}
			else{} //do nothing. Error will get thrown later.
			},

//clear the message entirely. run after a close. removes element from DOM.
		destroy : function(){
			this.element.empty().remove();
			}
		}); // create the widget
})(jQuery); 