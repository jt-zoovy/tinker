//http://net.tutsplus.com/tutorials/javascript-ajax/coding-your-first-jquery-ui-plugin/
(function($) {
	$.widget("ui.anypanel",{
		options : {
			state : 'expand', //expand, collapse and persistent. are acceptable values. sets panel contents to opened or closed.
			templateID : null, //what any commerce template to use to populate the panel.
			data : {}, //what data to use to translate the panel.
			dataAttribs : {}, //optional set of params to set as data on content. currently, only used if content is generated from templateID.
			call : null,
			callParams : null,
			_tag : {},
			showClose : true, //set to false to disable close (X) button.
			showLoading : true, //set to false to disable showLoading()
			content : null, //a jquery object of content to use.
			wholeHeaderToggle : true, //set to false if only the expand/collapse button should toggle panel (important if panel is draggable)
			header : null, //if set, will create an h2 around this and NOT use firstchild.
			q : 'mutable', //which q to use.
			extension : '', //used in conjunction w/ persist.
			name : '', //used in conjunction w/ persist.
			persistent : false, //if set to true and name AND extension set, will save to localStorage
			persistentStateDefault : 'expand',
			settingsMenu : {}
			},
		_init : function(){
			var
				self = this,
				o = self.options, //shortcut
				$t = self.element;
			
//			app.u.dump("BEGIN anypanel._init");
//			app.u.dump(" -> options: "); app.u.dump(o);
			if($t.data('isanypanel'))	{} //already a panel, skip all the styling and data.
			else	{
//isanypanel data is set to true as an easy check to
				$t.addClass('ui-widget ui-widget-anypanel marginBottom').data('isanypanel',true).css('position','relative');
				if(o.name)	{$t.addClass('panel_'+o.name)} 
				var $header, $content;
				
				if(o.header)	{$header = $("<h2 \/>").text(o.header); $header.appendTo($t)}
				else	{$header = $t.children(":first")}
				
				$header.css({'fontSize':'.85em','lineHeight':'2em','textIndent':'.75em','border':'none'});
				$header.wrap($("<div \/>").addClass('ui-widget-header ui-anypanel-header ui-corner-top ').css({'padding':'0px;','minHeight':'24px'}));

				if(o.wholeHeaderToggle)	{
					$header.addClass('pointer').off('click.toggle').on('click.toggle',function(){self.toggle()});
					}
				
				self._handleButtons($header);
			
				$content = self._anyContent();
				
//* 201320 -> if _anyContent returned false, this caused a js error.
				if($content && $content.length)	{$content.appendTo($t);} //content generated via template of some kind.
				else if(o.title)	{$content = $t.children(":first");} //no content yet, title specified. use first child.
				else	{$content = $t.children(":nth-child(2)");} //no content. first child is title. second child is content.
				
				$content.addClass('ui-widget-content ui-corner-bottom stdPadding ui-anypanel-content').css('borderTop','0'); //content area.

				if(o.call && typeof app.ext.admin.calls[o.call] == 'object')	{
					if(o.callParams)	{
						app.ext.admin.calls[o.call].init(o.callParams,o._tag,o.Q);
						}
					else	{
						app.ext.admin.calls[o.call].init(o._tag,o.Q);
						}
					if(o.showLoading){$t.showLoading();}
					}
				//appevents should happen outside this so that any other manipulation can occur prior to running them.
				//and also so that in cases where the events are not desired, there's no problem (recycled templates, for example)
				//they'll get executed as part of the callback if a call is specified.
				self._handleInitialState();
				}
			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			switch (option)	{
				case 'state':
					(value === 'collapse') ? this.collapse() : this.expand(); //the expand/collapse function will change the options.state val as well.
					break;

				case 'settingsMenu':
					$.extend(this.options.menu,value); //add the new menu to the existing menu object. will overwrite if one already exists.
					this._destroySettingsMenu();
					this._buildSettingsMenu();
					break;
				
				default:
//					app.u.dump("Unrecognized option passed into anypanel via setOption");
//					app.u.dump(" -> option: "+option);
					break;
				}
			},
		_anyContent : function()	{
			var 
				o = this.options,
				$content;

			if(o.content)	{
				$content = o.content;
				}
			else	{
				this.element.anycontent(this.options);
				}
			return $content;
			},

		_handleButtons : function($header)	{
			var
				self = this,
				$t = self.element,
				o = this.options,
				buttonStyles = {'float':'right','width':'20px','height':'20px','padding':0,'margin':'2px'}, //classes applied to each of the buttons.
				$buttonSet = $("<div \/>").addClass('floatRight').css({'position':'absolute','top':'2px','right':'2px'}).appendTo($header.parent()); 

//button to 'close' (removes from dom) the panel.			
			if(o.showClose)	{
				$buttonSet.append($("<button \/>").attr({'data-btn-action':'close','title':'close panel'}).addClass('ui-button-anypanel ui-button-anypanel-close').css(buttonStyles).button({icons : {primary : 'ui-icon-close'},'text':false}).on('click.panelClose',function(event){event.preventDefault(); self.destroy()})); //settings button
				}
//button to toggle (expand/collapse) the panel.
			$buttonSet.append($("<button \/>").attr({'data-btn-action':'toggle','title':'expand/collapse panel'}).addClass('ui-button-anypanel ui-button-anypanel-toggle').css(buttonStyles).button({icons : {primary : 'ui-icon-triangle-1-n'},'text':false}).on('click.panelViewState',function(event){event.preventDefault(); self.toggle()})); //settings button

//tools menu, which will be a wrench button with a dropdown of options.
			$buttonSet.append($("<button \/>").hide().attr('data-btn-action','settingsMenu').addClass('ui-button-anypanel ui-button-anypanel-settings').css(buttonStyles).text('Settings')
				.button({text: false,icons : {primary : 'ui-icon-wrench'}})
				.off('click.settingsMenu').on('click.settingsMenu',function(event){
					event.preventDefault();
					var $ul = $("[data-app-role='settingsMenu']",$t).toggle();

//this will make it so any click outsite the menu closes the menu. the one() means it only gets triggered once.
//it's inside the click handler, so it'll get added each time the settings are expanded.
					if($ul.is(":visible"))	{setTimeout(function(){$(document).one("click", function() {$ul.hide();});},1000);}
					
					})); //the settings button is always generated, but only toggled on when necessary.
			if(o.settingsMenu)	{self._buildSettingsMenu()}			

			},
// ** 201324 -> added means of setting a default for 'persistent' state so a panel could be closed if it has never been opened before.
		_handleInitialState : function()	{
			if(this.options.state == 'persistent' && this.options.name && this.options.extension)	{
//				app.u.dump(" -> using persistent settings");
				var settings = app.ext.admin.u.dpsGet(this.options.extension,'anypanel');
				if(settings && settings[this.options.name])	{
					this.options.state = settings[this.options.name].state; //if not defined, default to expand.
					}
				else if(this.options.persistentStateDefault == 'expand' || this.options.persistentStateDefault == ' collapse') {
					this.options.state = this.options.persistentStateDefault;
					}
				else	{
					this.options.state = 'expand';
					}
				}
//			app.u.dump("this.options.state: "+this.options.state);
			if(this.options.state == 'collapse')	{ this.collapse();}
			else if (this.options.state == 'expand')	{this.expand();}
			else	{
				console.warn("unknown state passed into anypanel");
				}
			},

		toggle : function(){
			if(this.options.state == 'expand')	{this.collapse()}
			else	{this.expand()}
			},

//the corner bottom class is added/removed to the header as the panel is collapsed/expanded, respectively, for aeshtetic reasons.
		collapse : function(preserveState){
			preserveState = preserveState || false; //set to true to collapse, but not change state. allows for mass collapse w/out session update and for restoring on a mass-restore
			$("[data-btn-action='toggle']",this.element).button({icons : {primary : 'ui-icon-triangle-1-s'},'text':false});
			$('.ui-widget-content',this.element).slideUp();
			$('.ui-widget-header',this.element).addClass('ui-corner-bottom');
			if(preserveState)	{}
			else	{
				this.options.state = 'collapse';
				this._handlePersistentStateUpdate('collapse');
				}
			},

		expand : function(){
			$("[data-btn-action='toggle']",this.element).button({icons : {primary : 'ui-icon-triangle-1-n'},'text':false});
			$('.ui-widget-content',this.element).slideDown();
			$('.ui-widget-header',this.element).removeClass('ui-corner-bottom');
			this.options.state = 'expand';
			this._handlePersistentStateUpdate('expand');
			},

		_handlePersistentStateUpdate : function(value)	{
//			app.u.dump("BEGIN anypanel._handlePersistentStateUpdate");
			var r = false; //will return true if a persistent update occurs.
//			app.u.dump(" -> this.options.persistent: "+this.options.persistent);
//			app.u.dump(" -> value: "+value);
			if(this.options.persistent && value)	{
				if(this.options.extension && this.options.name)	{
					var settings = {};
					settings[this.options.name] = {'state':value};
					var newSettings = $.extend(true,app.ext.admin.u.dpsGet(this.options.extension,'anypanel'),settings); //make sure panel object exits.
//					app.u.dump(' -> '+this.options.extension);
//					app.u.dump(' -> newSettings:');	app.u.dump(newSettings);
					app.ext.admin.u.dpsSet(this.options.extension,'anypanel',newSettings); //update the localStorage session var.
					r = true;
					}
				else	{
					app.u.dump("anypanel has persist enabled, but either name ["+this.name+"] or extension ["+this.extension+"] not declared. This is a non-critical error, but it means panel will not be persistent.",'warn');
					}
				}
			return r;
			},

		_destroySettingsMenu : function()	{
			$("[data-app-role='settingsMenu']",this.element).empty().remove();
			},

		_buildSettingsMenu : function()	{
			var $ul = $("<ul \/>").css({'width':'200px'}),
			sm = this.options.settingsMenu;

			$ul.attr('data-app-role','settingsMenu').hide().css({'position':'absolute','right':0,'zIndex':10000});
			for(var index in sm)	{
				$("<li \/>").addClass('ui-state-default').on('click',sm[index]).on('click.closeMenu',function(){
					$ul.menu( "collapse" ); //close the menu.
					}).hover(function(){$(this).addClass('ui-state-hover')},function(){$(this).removeClass('ui-state-hover')}).text(index).appendTo($ul);
				}
			if($ul.children().length)	{
				$ul.menu();
				$("[data-btn-action='settingsMenu']",this.element).show().closest('.ui-widget-header').after($ul);
				}
			else	{} //no listitems. do nothing.

			},
			
		destroy : function(){
			var $t = this.element;
			this.element.slideUp('fast',function(){$t.empty().remove();});
			}
		}); // create the widget
})(jQuery); 