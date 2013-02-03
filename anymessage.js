//http://net.tutsplus.com/tutorials/javascript-ajax/coding-your-first-jquery-ui-plugin/
(function($) {
	$.widget("ui.anymessage",{
		options : {
			selector : null, //can be a string (a jq selector) or a jquery object.
			message : null, //a string or a anycommerce message object (err or _msg or @issues are acceptable)
			gMessage : false, //set to true to throw a generic message. Will include extra error details
			containerClass : 'ui-state-highlight', //will be added to container, if set. will add no ui-state class if this is set.
			iconClass : null, //for icon display. ex: ui-state-info. if set, no attempt to auto-generate icon will be made.
			persistant : false //if true, message will not close automatically. WILL still generate a close button.
			},

		_init : function(){
			if(this.options.selector && typeof this.options.selector === 'string')	{this.element = $(selector);} // !!! needs to be app.u.jqSelector here.
			else if(this.options.selector && typeof this.options.selector === 'object')	{this.element =this.options.selector}
			else	{}
			
			var self = this,
			o = self.options, //shortcut
			$t = self.element; //this is the targeted element (ex: $('#bob').anymessage() then $t is bob)
			
			self.output = self._getContainer(); //the jquery object of the message output.
			
			self.output.append(self._getCloseButton()); //a close button is always generated, even on a persistent message.
			self.output.append(self._getIcon());
			self.output.append(self._getFormattedMessage());
			self.output.prependTo($t);
			
			if(o.persistant)	{} //message is persistant. do nothing.
			else	{this.ts = setTimeout(function(){$t.anymessage('close');},10000);} //auto close message after a short duration.
			
			
			
			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			},

//an animated 'close'
		close : function(){
//the message could be removed manually prior to the callback being executed, so don't animate if that's the case. (avoids popping issue)
			if(this.element.is(':visible'))	{
				this.element.slideUp('slow');
				}
			else	{} //already closed. do nothing. could get here if message closed manually, before timeout runs.
			},

		_getIcon : function()	{
			var o = this.options, //shortcut
			msg = o.message,
			r; //what is returned
			if(o.iconClass)		{}
			else if(msg && typeof msg == 'object' && msg.errtype)	{o.iconClass = 'ui-icon-'+msg.errtype}
			else if(msg && typeof msg == 'object' && msg['_msg_0_type'])	{o.iconClass = 'ui-icon-'+msg['_msg_0_type']} //only 1 icon is displayed, so just show the first.
			else	{o.iconClass = 'ui-icon-info'}
			
			return $("<span \/>").addClass('ui-icon ui-icon-anymessage').addClass(o.iconClass).css({'float':'left','marginRight':'5px','marginBottom':'5px','marginTop':'3px'});
			},

		_getCloseButton : function()	{
			var $t = this.element;
			return $("<button \/>")
				.text('close message').css({'float':'right','marginLeft':'5px','marginBottom':'5px'})
				.button({icons: {primary: "ui-icon-circle-close"},text: false})
				.on('click.closeMsg',function(){$t.anymessage('close')});
			},

//adds the outer 'container' div around the message.
		_getContainer : function()	{
			return $("<div \/>").addClass("ui-widget ui-widget-content ui-corner-all marginBottom").css({'padding':'5px','min-height':'28px'}).addClass(this.options.containerClass);
			},


		_getFormattedMessage : function(m)	{
			var o = this.options, //shortcut
			msg = m || o.message, //shortcut to the message itself.
			msgDetails = "", //used for iseerr (server side error) and ise/no response
			$r, //what is returned.
			amcss = {'margin':'0','paddingBottom':'5px'} //anyMessageCSS - what's applied P (or each P in the case of _msgs)
			if(!msg)	{
				//no message passed. is ok because messages 'could' get handled as a method.
				}
			else if(typeof msg == 'string')	{
				$r = $("<p \/>").addClass('anyMessage').css(amcss).text(msg);
				}
			else if(typeof msg == 'object')	{
				if(msg['_msgs'])	{
					$r = $("<div \/>").css({'margin-left':'20px'}); //adds a left margin to make multiple messages all align.
					for(var i = 1; i <= msg['_msgs']; i += 1)	{
						$r.append($("<p \/>").addClass('anyMessage').css(amcss).addClass(msg['_msg_'+i+'_type']).text(msg['_msg_'+i+'_txt']+" ["+msg['_msg_'+i+'_id']+"]"));
						}
					}
				else if(msg['errid'])	{
					$r = $("<p \/>").addClass('anyMessage').css(amcss).addClass(msg.errtype).text(msg.errmsg+" ["+msg.errid+"]");
					if(msg.errtype == 'iseerr')	{
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
					$r = $("<p \/>").addClass('anyMessage').text('unknown error has occured');
					} //unknown data format
				}
			else	{
				app.u.dump(" -> app.u.formatResponseErrors 'else' hit. Should not have gotten to this point");
				$r = $("<p \/>").addClass('anyMessage').text('unknown error has occured'); //don't want to have our error handler generate an error on screen.
				}
			return $r;

			},

		addMessage : function(m)	{
			console.log("Here comes my M face:"); console.dir(m);
			this.output.append(this._getFormattedMessage(m));
			},

//clear the message entirely. run after a close. removes element from DOM.
		destroy : function(){
			this.element.empty().remove();
			}
		}); // create the widget
})(jQuery); 