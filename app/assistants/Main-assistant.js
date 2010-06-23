MainAssistant = Class.create(Twee.Base , {
	Binds: ['navigationChange',
			'writeIconClick',
			'activateWindow'
	],
	
	Menu: [{label: 'Switch Accounts' , command: 'switchAccounts'}],
	listViews: ['timeline-view' , 'mentions-view' , 'messages-view'],
	handleCommand: function(evt)
	{
		if (evt.type == Mojo.Event.command) 
		{
			switch (evt.command) 
			{
				case 'switchAccounts':
					var card = Twee.getManageAccountCard();
					Twee.StageManager.newCard(card , 'ManageAccounts');
				break;
			}
		}
		return this.doHandleCommand(evt);
	},
	
	setup: function($super)
	{
		this.views = {};
		this.account = this.options.account;
		$super();
		this.applyFontSize();
		this.setupView();
		this.get('write-icon').observe(Mojo.Event.tap , this.writeIconClick);
		
		this.controller.stageController.document.observe(Mojo.Event.stageActivate, this.activateWindow);
	},
	
	cleanup: function($super)
	{
		this.controller.stageController.document.stopObserving(Mojo.Event.stageActivate, this.activateWindow);
		this.get('write-icon').stopObserving(Mojo.Event.tap , this.writeIconClick);
		this.navigation.stopObserving('change' , this.navigationChange);
		this.navigation.cleanup();
		for(var i in this.views) if (this.views.hasOwnProperty(i))
		{
			if (this.views[i].cleanup)
			{
				this.views[i].cleanup();
			}
		}
		$super();
	},
	
	activate: function(o)
	{
		o = o || {};
		this.navigation.orientationChange();
		if (o.switchTo)
		{
			this.activateAndSwitchToSubview(o.switchTo);
		}
		else if (o.refreshTimeline)
		{
			if (this.currentSubview && this.currentSubview.id === "timeline-view")
			{
				this.currentSubview.widget.refreshList();
			}
		}
		else if (o.removeTweet)
		{
			if (this.currentSubview && this.currentSubview.widget && this.currentSubview.widget.removeTweet)
			{
				this.currentSubview.widget.removeTweet(o.removeTweet);
			}
		}
	},
	
	setupView: function()
	{
		var mainhdr = this.get('main-hdr'),
			subView = this.options.subView || "timeline";
		mainhdr.update(this.account.username);
		
		this.setupLists();
		
		this.navigation = new Twee.Nav(this.get('twee-footer') , subView);
		this.navigation.observe('change' , this.navigationChange);
		this.activateSubview(subView);
	},
	
	setupLists: function()
	{
		var ids = $A(this.listViews);
		ids.each(function(id) {
			this.views[id] = new Twee.List({controller: this , account: this.account , scroller: this.scroller , useStorage: true}).setup(id);
		} , this);
		
		this.views['trends-view'] = new Twee.TrendView({controller: this , account: this.account , scroller: this.scroller}).setup('trends-view');
		this.views['search-view'] = new Twee.SearchView({controller: this , account: this.account , scroller: this.scroller}).setup('search-view');
		this.views['my-account-view'] = new Twee.MyAccountView({controller: this , account: this.account , scroller: this.scroller}).setup('my-account-view');
	},
	
	orientationChanged: function($super , orientation)
	{
		$super(orientation);
		this.navigation.orientationChange();
	},
	
	navigationChange: function(evt)
	{
		this.activateSubview(evt.name);
	},
	
	activateAndSwitchToSubview: function(name)
	{
		this.navigation.activateTab(name , true);
		this.activateSubview(name);
	},
	
	activateSubview: function(subview)
	{
		if (this.currentSubview)
		{
			this.deactivateSubview(this.currentSubview);
		}
		this.activateSubviewChain(subview); // chaining made the image flash, UGLY.
	},
	
	activateSubviewChain: function(subview)
	{
		this.currentSubview = this.get(subview + '-view');
		if (this.currentSubview && this.currentSubview.widget && this.currentSubview.widget.aboutToActivate)
		{
			this.currentSubview.widget.aboutToActivate();
		}
		
		var type = this.currentSubview.readAttribute('type');
		this.currentSubview.addClassName('show');
		if (type == 'list')
		{
			this.normalBackground();
		}
		else
		{
			this.altBackground();
		}
		
		if (this.currentSubview && this.currentSubview.widget && this.currentSubview.widget.activate)
		{
			this.currentSubview.widget.activate();
		}
	},
	
	deactivateSubview: function()
	{
		if (this.currentSubview && this.currentSubview.widget && this.currentSubview.widget.aboutToDeactivate)
		{
			this.currentSubview.widget.aboutToDeactivate();
		}
		this.currentSubview.removeClassName('show');
		window.setTimeout(this.deactivateSubviewChain.bind(this , this.currentSubview) , 0);
	},
	
	deactivateSubviewChain: function(subView)
	{
		if (subView && subView.widget && subView.widget.deactivate)
		{
			subView.widget.deactivate();
		}
	},
	
	activateWindow: function()
	{
		if (this.listViews.indexOf(this.currentSubview.id) != -1)
		{
			this.currentSubview.widget.windowWasActivated();
		}
	},
	
	writeIconClick: function()
	{
		this.newTweet();
	},
	
	newTweet: function()
	{
		this.push('NewTweet' , {account: this.account});
	},
	
	listHasNewContent: function(id)
	{
		var name = id.substr(0 , id.length-5);
		if (this.currentSubview.id == id)
		{
			this.navigation.fireLight(name);
		}
		else
		{
			this.navigation.addLight(name);
		}
	}
	
});
