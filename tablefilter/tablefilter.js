//http://net.tutsplus.com/tutorials/javascript-ajax/coding-your-first-jquery-ui-plugin/
(function($) {
	$.widget("ui.anytablefilter",{
		options : {
			state : 'expand', //expand, collapse and persistent. are acceptable values. sets panel contents to opened or closed.
			filterSelector : ":input[name='tableSearchQuery']",
			tableSelector : "[data-tablefilter-role='table']",
			tablefilterSelector : 'tbody tr', //this may sometimes be tbody if the table is composed of tbodys. It was what will be hidden if no match is found in the td.
			searchIsRunning : false, //used internally to determine if a search is currently running.
			killSearch : false //used internally. will be set to true when a new search is performed to stop any searches in progress. eliminates two searches being run at once and potential for browser crashing on large datasets.
			},
		_create : function(){
			console.log("BEGIN _create");
			if(this._validate())	{
				console.log(" -> tablefilter validated");
				this._addEvent2Filter();
				}
			else	{
				//validation not passed. validator handles errors.
				}

			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			},
		
		_addEvent2Filter : function()	{
			console.log("BEGIN _addEvent2Filter");
			//for now, just support a keywords input.  add support for select/radio/checkbox/etc later (change instead of keyup)
			//There's only 1 event being added within the table, so no need to use delegation. add it directly to the input.
			var self = this;
			$(self.options.filterSelector,this.element).on('keyup',function(){
				console.log(" -> keyup event triggered");

				if(self.options.searchIsRunning)	{
					self.options.killSearch = true; //end any currently running searches.
					}
				var filter = $(this).val();
				setTimeout(function(){
					self.filter(filter);
					},100); //slight delay so the current loop can stop itself.
				
				});
			},
		
		filter : function(filter)	{
			console.log(" -> filtering for: "+filter);
			var self = this, $table = $(this.options.tableSelector,this.element);
			filter = filter.toString().toLowerCase();
			if(filter.length > 2)	{

//only rows that are not already hidden are impacted. In some cases, some other operation may have hidden the row and we don't want our 'unhide' later to show them.
//the 'not' is to target only the first level of table contents, no nested data (used in domains, for example).
				$(self.options.tablefilterSelector+':visible',self.element).not(self.options.tablefilterSelector+' tbody',self.element).hide().data('hidden4Search',true);				
				
				$('td.isSearchable',$table).each(function(){
					//when a new search starts, kill search is enabled to make sure concurrent searches don't occur.
					if(self.options.killSearch)	{
						self.options.killSearch = false;
						return;
						}
					var $td = $(this);
					if($td.text().toLowerCase().indexOf(filter) >= 0)	{
						$td.closest(self.options.tablefilterSelector).show();
						$td.addClass('queryMatch');
						}
					});
				}
			else	{
				//no query or short query. unhide any rows (query may have been removed).
				$((self.options.tablefilterSelector),$table).each(function(){
					if($(this).data('hidden4Search'))	{$(this).show();}
					});
				$('.queryMatch',$table).removeClass('queryMatch');
				}


			},
		
		_validate : function()	{
			var r = true; //what is returned. true if valid, false otherwise.
			//make sure a keywords input of some kind exists. Can't filter without a filter.
			if($(this.options.filterSelector,this.element).length)	{
				if($('.isSearchable',this.element).length == 0)	{
					r = false;
					dump(" -> tableFilter was run on a table with no searchable td's. Add the isSearchable class to at least one td.");
					}
				if($(this.options.tableSelector,this.element).length == 0)	{
					r = false;
					dump(" -> tableFilter was run on a table with no searchable td's. Add the isSearchable class to at least one td.");
					}
				}
			else	{
				r = false;
				dump(" -> unable to invoke anytablefilter because target element does not contain a filter");
				}
			
			if(!r)	{$(this.options.filterSelector,this.element).prop('disabled','disabled');}
			return r;
			},
			
		_destroy : function(){
			var $t = this.element;
			this.element.slideUp('fast',function(){$t.empty().remove();});
			}
		}); // create the widget
})(jQuery); 