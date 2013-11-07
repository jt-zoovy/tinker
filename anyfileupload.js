(function($) {
	var targetPHP = "https://www.zoovy.com/webapi/jquery/index.cgi?up=true"; // global for testing.
	$.widget("ui.anyfiledrop",{
		options : {
			filetypes : null, //pass in an array of file types supported. ex ['csv','xls']
			imageAttributes : null, //an object: {h:100,w:100,b:'ffffff'}. if thumbList is not set, this won't be used.
			status : null, //a jquery object or selector of where status updates should be displayed.
			thumbList : null, //a jquery object or selector of where thumbnails of successfully uploaded images should be placed.
			fpath : null, //folder in media library where images are placed.
			_preview : null //used to store the preview.
			},
		_init : function(){
			console.log('got to init');
			var
				$dropzone = this.element,
				anyfiledrop = this; //inside the event handlers below, 'this' loses context.
			
			if($dropzone.data('widget-anyfileupload'))	{} //already an anyfileupload
			else{
				$dropzone.data('widget-anyfileupload',true);
				if(this.options.status instanceof jQuery)	{
					console.log(" -> status element IS defined.");
					}
				
				if(this.options.thumbList instanceof jQuery)	{
					console.log(" -> thumblist element IS defined.");
					}
				
				$dropzone.on("dragover dragenter", function(event) {
					event.stopPropagation();
					event.preventDefault();
					})
					
				$dropzone.on("drop",function(event){
					event.preventDefault();
					event.stopPropagation();
					anyfiledrop._drop(event);
					});
				}			

			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			}, //_setOption

		_drop : function(event)	{
			event.preventDefault();
			var dt = event.originalEvent.dataTransfer;
			var files = dt.files;
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				this._upload(file);
				}
			}, //_drop

		_upload : function(file){
			//fileReader docs: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
			var reader = new FileReader();
			var folder = this.options.fpath || file.name.charAt(0);
//			var bin = reader.result;
			app.u.dump(" -> adding file: "+file.name+" to fpath "+folder);
			app.model.addDispatchToQ({
				'_cmd':'adminImageUpload',
				'_tag':	{
					base64 : btoa(reader.readAsBinaryString), //btoa is binary to base64
					folder : folder,
					filename : file.name
					}
				},'mutable');
			app.model.dispatchThis('mutable');
			}, //upload

		_destroy : function(){
			this.element.empty();
			} //_destroy
		}); // create the widget
})(jQuery); 
