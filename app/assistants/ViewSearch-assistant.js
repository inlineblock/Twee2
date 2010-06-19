ViewSearchAssistant = Class.create(Twee.Base , {
	Binds: ['saveSearchClick' , 'unsaveSearchCallBack' , 'saveSearchCallBack'],
	setup: function($super)
	{
		this.search = this.options.search;
		this.account = this.options.account;
		$super();
		this.altBackground();
		var mainhdr = this.get('main-hdr');
		mainhdr.innerHTML = this.options.search.escapeHTML();
		
		this.list = new Twee.SearchList({controller: this , account: this.account , scroller: this.scroller}).setup("search-view");
		this.list.element.addClassName('show');
		
		this.saveSearchButton = this.get('save-search');
		this.saveSearchButton.observe(Mojo.Event.tap , this.saveSearchClick);
	},
	
	activate: function()
	{
		//this.list.aboutToActivate();
		//this.list.activate();
		
	},
	
	cleanup: function($super)
	{
		this.saveSearchButton.stopObserving(Mojo.Event.tap , this.saveSearchClick);
		this.list.cleanup();
		$super();
	},
	
	saveSearchClick: function(evt)
	{
		if (this.options.savedSearch)
		{
			this.account.unsaveSearch({callBack: this.unsaveSearchCallBack , id: this.options.savedSearch});
			this.showLoading("Unsaving...");
		}
		else
		{
			this.account.saveSearch({callBack: this.saveSearchCallBack , query: this.search});
			this.showLoading("Saving...");
		}
	},
	
	unsaveSearchCallBack: function(worked)
	{
		this.hideLoading();
		if (!worked)
		{
			this.errorDialog("Unable to unsave your search at this time.");
		}
	},
	
	saveSearchCallBack: function(worked , id)
	{
		this.hideLoading();
		if (!worked)
		{
			this.errorDialog("Unable to save your search at this time.");
		}
		else
		{
			this.options.savedSearch = id;
		}
	}
	
});