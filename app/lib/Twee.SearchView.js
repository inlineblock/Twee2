Twee.SearchView = Class.create({
	savedSearchTemplate: "Main/saved-search",
	initialize: function(o)
	{
		this.controller = o.controller;
		this.account = o.account;
		this.scroller = o.scroller;
		
		this.savedSearches = [];
		
		this.refreshIconClick = this.refreshIconClick.bind(this);
		this.searchButtonClick = this.searchButtonClick.bind(this);
		this.searchTermsType = this.searchTermsType.bind(this);
		this.loadSaveSearchesCallBack = this.loadSaveSearchesCallBack.bind(this);
		this.savedSearchesListClick = this.savedSearchesListClick.bind(this);
		this.searchUsersType = this.searchUsersType.bind(this);
		this.userSearchButtonClick = this.userSearchButtonClick.bind(this);
	},
	
	setup: function(id)
	{
		this.element = this.controller.get(id);
		this.element.widget = this;
		return this;
	},
	
	doSetup: function()
	{
		this.searchModel = {value: ""};
		this.controller.controller.setupWidget('searchTerms' , {hintText: "Search Terms" , multiline: false, focus: false , textCase: Mojo.Widget.steModeLowerCase , changeOnKeyPress: true , requiresEnterKey: true} , this.searchModel);
		
		
		this.searchUserModel = {value: ""};
		this.controller.controller.setupWidget('searchUsers' , {hintText: "Name or Username" , multiline: false, focus: false , textCase: Mojo.Widget.steModeLowerCase , changeOnKeyPress: true , requiresEnterKey: true} , this.searchUserModel);
		
		this.refreshIcon = this.element.down('.refresh-icon');
		if (this.refreshIcon)
		{
			this.refreshIcon.observe(Mojo.Event.tap , this.refreshIconClick);
		}
		this.searchButton = this.controller.get('search-button');
		this.searchButton.observe(Mojo.Event.tap , this.searchButtonClick);
		
		this.searchTerms = this.controller.get('searchTerms');
		this.searchTerms.observe(Mojo.Event.propertyChange , this.searchTermsType);
		
		this.searchUsers = this.controller.get('searchUsers');
		this.searchUsers.observe(Mojo.Event.propertyChange , this.searchUsersType);
		
		this.userSearchButton = this.controller.get('user-search-button');
		this.userSearchButton.observe(Mojo.Event.tap , this.userSearchButtonClick);
		
		this.savedSearchesList = this.element.down('.saved-searches-list');
		this.savedSearchesList.observe(Mojo.Event.tap , this.savedSearchesListClick);
		this.savedSearchesListFooter = this.element.down('.saved-searches-list-footer');
		
		this.controller.controller.instantiateChildWidgets(this.element);
		return this;
	},
	
	doCleanup: function(id)
	{
		if (this.refreshIcon)
		{
			this.refreshIcon.stopObserving(Mojo.Event.tap , this.refreshIconClick);
		}
		this.searchButton.stopObserving(Mojo.Event.tap , this.searchButtonClick);
		this.searchTerms.stopObserving(Mojo.Event.propertyChange , this.searchTermsType);
		this.savedSearchesList.stopObserving(Mojo.Event.tap , this.savedSearchesListClick);
		this.searchUsers.stopObserving(Mojo.Event.propertyChange , this.searchUsersType);
		this.userSearchButton.stopObserving(Mojo.Event.tap , this.userSearchButtonClick);
		
	},
	
	cleanup: function()
	{
		if (this.hasBeenSetup)
		{
			this.doCleanup();
			this.hasBeenSetup = false;
		}
	},
	
	aboutToActivate: function()
	{
		if (!this.hasBeenSetup)
		{
			this.doSetup();
			this.hasBeenSetup = true;
		}
		
	},
	
	activate: function()
	{
		this.readjustScrollTop();
		this.controller.get('searchTerms').focus();
		
		if (!this.element.hasClassName('loading') && (!this.lastSaveSearchTime || this.lastSaveSearchTime < Morsel.getTimeStamp() - 600))
		{
			this.loadSaveSearches();
			this.lastSaveSearchTime = Morsel.getTimeStamp();
		}
	},
	
	aboutToDeactivate: function()
	{
		
	},
	
	loadSaveSearches: function()
	{
		this.element.addClassName('loading');
		this.savedSearchesList.removeClassName('error').removeClassName('empty');
		this.savedSearchesList.innerHTML = "";
		
		this.account.getSavedSearches({callBack: this.loadSaveSearchesCallBack});
	},
	
	loadSaveSearchesCallBack: function(worked , data)
	{
		this.element.removeClassName('loading');
		if (!worked)
		{
			this.savedSearchesList.addClassName('error');
			this.savedSearchesList.innerHTML = "Error loading saved searches.";
		}
		else
		{
			if (data.length === 0)
			{
				this.savedSearchesList.addClassName('empty');
				this.savedSearchesList.innerHTML = "No saved searches found.";
			}
			else
			{
				var html = [];
				data.each(function(search) {
					html.push(Mojo.View.render({object: search , template: this.savedSearchTemplate}));
				} , this);
				this.savedSearchesList.innerHTML = html.join('');
			}
		}
		this.savedSearchesListFooter.innerHTML = "Last Updated on " + new Date().format(Morsel.dateTimeFormat);
	},
	
	searchButtonClick: function()
	{
		if (this.searchModel.value != "")
		{
			this.loadSearch(this.searchModel.value);
		}
	},
	
	userSearchButtonClick: function()
	{
		if (this.searchUsers.value != "")
		{
			this.loadSearchUsers(this.searchUserModel.value);
		}
	},
	
	searchTermsType: function(evt)
	{
		if (evt.originalEvent && evt.originalEvent.keyIdentifier == "Enter" && this.searchModel.value != "")
		{
			this.loadSearch(this.searchModel.value);
		}
	},
	
	searchUsersType: function(evt)
	{
		if (evt.originalEvent && evt.originalEvent.keyIdentifier == "Enter" && this.searchUsers.value != "")
		{
			this.loadSearchUsers(this.searchUserModel.value);
		}
	},
	
	savedSearchesListClick: function(evt)
	{
		var el = evt.target;
		if (!el.hasClassName('saved-search-item'))
		{
			el = el.up('.saved-search-item');
		}
		
		if (!el)
		{
			return false;
		}
		
		this.loadSearch(el.down('.title').innerHTML , el.id.substr(3));
	},
	
	
	loadSearch: function(text , savedSearch)
	{
		savedSearch = savedSearch || false;
		this.controller.push("ViewSearch" , {account: this.account , search: text , savedSearch: savedSearch});
	},
	
	loadSearchUsers: function(text)
	{
		this.controller.push("ViewUserSearch" , {account: this.account , search: text});
	},
	
	readjustScrollTop: function()
	{
		if (this.element.hasClassName('show'))
		{
			this.scroller.scrollTop = 0;
		}
	},
	
	refreshIconClick: function()
	{
		this.loadSaveSearches();
	}
});