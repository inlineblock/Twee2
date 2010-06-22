ViewSearchAssistant = Class.create(Twee.Base , {
	Binds: ['saveSearchClick' , 'unsaveSearchCallBack' , 'saveSearchCallBack' , 'nearbySearchClick' , 'getLocationSuccess' , 'getLocationFailure' , 'nearbyDistanceListChange'],
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
		
		this.nearbySearchButton = this.get('nearby-search');
		this.nearbySearchButton.observe(Mojo.Event.tap , this.nearbySearchClick);
		
		this.distanceChoices = [{label : '5 Miles', value: '5mi'} , {label : '10 Miles', value: '10mi'},{label : '25 Miles', value : '25mi'},{label : '50 Miles', value : '50mi'},{label : '100 Miles', value : '100mi'}];
		this.distanceModel = {value: "10mi"};
		this.controller.setupWidget('nearbyDistanceList', {label: $L("Distance") , choices: this.distanceChoices} , this.distanceModel);
		this.nearbyDistanceList = this.get('nearbyDistanceList');
		this.nearbyDistanceList.observe(Mojo.Event.propertyChange , this.nearbyDistanceListChange);
	},
	
	activate: function()
	{
		
	},
	
	cleanup: function($super)
	{
		this.saveSearchButton.stopObserving(Mojo.Event.tap , this.saveSearchClick);
		this.nearbySearchButton.stopObserving(Mojo.Event.tap , this.nearbySearchClick);
		this.nearbyDistanceList.stopObserving(Mojo.Event.propertyChange , this.nearbyDistanceListChange);
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
	},
	
	nearbySearchClick: function()
	{
		if (this.nearbyLocation)
		{
			this.nearbyLocation = false;
			this.list.location = false;
			this.list.clearTweets();
			this.list.refreshList(true);
			this.scroller.removeClassName('has-nearby-location');
			this.autoScrollClick();
		}
		else
		{
			this.list.location = false;
			this.list.clearTweets();
			this.getLocation();
			this.autoScrollClick();
		}
	},
	
	getLocation: function()
	{
		if (!this.attachingLocation)
		{
			this.showLoading("Locating You...");
			this.attachingLocation = true;
			this.controller.serviceRequest('palm://com.palm.location', {
				method : 'getCurrentPosition',
		        parameters: {
					accuracy: 2 ,
		            maximumAge: 0
		        },
		        onSuccess: this.getLocationSuccess,
		        onFailure: this.getLocationFailure
		    });
	    }
	},
	
	getLocationSuccess: function(evt)
	{
		this.scroller.addClassName('has-nearby-location');
		this.hideLoading();
		this.attachingLocation = false;
		this.list.location = {latitude:evt.latitude , longitude: evt.longitude , lastUpdate: new Date().getTime() , radius: this.distanceModel.value};
		this.nearbyLocation = this.list.location;
		this.list.refreshList(true);
	},
	
	getLocationFailure: function()
	{
		this.hideLoading();
		this.attachingLocation = false;
		this.errorDialog("Unable to locate you.");
	},
	
	nearbyDistanceListChange: function()
	{
		this.list.clearTweets();
		this.list.location.radius = this.distanceModel.value;
		this.nearbyLocation = this.list.location;
		this.list.refreshList(true);
	}
	
});