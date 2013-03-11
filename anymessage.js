
(function($) {
	$.widget("ui.anymessage",{
		options : {
			message : null, //a string for output. if set, will ignore any _msgs or _err orr @issues in the 'options' object (passed by a request response)
			gMessage : false, //set to true to throw a generic message. Will include extra error details
			containerClass : 'ui-state-highlight', //will be added to container, if set. will add no ui-state class if this is set.
			iconClass : null, //for icon display. ex: ui-state-info. if set, no attempt to auto-generate icon will be made.
			persistant : false //if true, message will not close automatically. WILL still generate a close button. iseerr's are persistant by default
			},

		_init : function(){
//			app.u.dump("BEGIN anymessage");
			var self = this,
			o = self.options, //shortcut
			$t = self.element; //this is the targeted element (ex: $('#bob').anymessage() then $t is bob)

			o.messageElementID = 'msg_'+app.u.guidGenerator(); //a unique ID applied to the container of the message. used for animating.
			
//the content is in an array because otherwise adding multiple messages to one selector causes them to share properties, which is not a desired behavior.
			if(typeof self.outputArr == 'object')	{}
			else	{self.outputArr = new Array()}
			
			var i = self.outputArr.push(self._getContainer()) - 1;  //the jquery object of the message output.
			self.outputArr[i].attr('id',o.messageElementID);
			
			self.outputArr[i].append(self._getCloseButton()); //a close button is always generated, even on a persistent message.
			self.outputArr[i].append(self._getIcon());
			self.outputArr[i].append(self._getFormattedMessage(i));
			$t.prepend(self.outputArr[i]); //

			if(o.persistant)	{} //message is persistant. do nothing.
			else	{this.ts = setTimeout(function(){$t.anymessage('close');},10000);} //auto close message after a short duration.
			
			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			},



		_getIcon : function()	{
			var o = this.options, //shortcut
			msg = o.message,
			r; //what is returned
			if(o.iconClass)		{}
			else if(msg && typeof msg == 'object' && msg.errtype)	{o.iconClass = 'ui-icon-z-'+msg.errtype}
			else if(msg && typeof msg == 'object' && msg['_msg_0_type'])	{o.iconClass = 'ui-icon-z-'+msg['_msg_0_type']} //only 1 icon is displayed, so just show the first.
			else	{o.iconClass = 'ui-icon-info'}
//			app.u.dump(" -> o.iconClass: "+o.iconClass);
			return $("<span \/>").addClass('ui-icon ui-icon-anymessage').addClass(o.iconClass).css({'float':'left','marginRight':'5px','marginBottom':'5px','marginTop':'3px'});
			},

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



