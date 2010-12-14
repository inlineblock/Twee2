Twee.MyAccountView = Class.create({
	emptyListTemplate: "Main/empty-list",
	listTemplate: "Main/list",
	initialize: function(o)
	{
		this.controller = o.controller;
		this.account = o.account;
		this.scroller = o.scroller;
		
		this.myAccountActionsClick = this.myAccountActionsClick.bind(this);
		this.listsClick = this.listsClick.bind(this);
		this.renderLists = this.renderLists.bind(this);
		
		this.lists = [];
		this.activeRequests = {};
	},
	
	setup: function(id)
	{
		this.element = this.controller.get(id);
		this.element.widget = this;
		return this;
	},
	
	doSetup: function(id)
	{
		//this.element = this.controller.get(id);
		
		this.myAccountActions = this.element.down('#my-account-actions');
		this.myAccountActions.observe(Mojo.Event.tap , this.myAccountActionsClick);
		
		this.listElement = this.element.down('#lists-list');
		this.listElement.observe(Mojo.Event.tap , this.listsClick);
		
		this.listFooter = this.element.down('#lists-list-footer');
		
		//this.element.widget = this;
		return this;
	},
	
	doCleanup: function()
	{
		this.myAccountActions.stopObserving(Mojo.Event.tap , this.myAccountActionsClick);
		this.listElement.stopObserving(Mojo.Event.tap , this.listsClick);
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
		if (!this.element.hasClassName('loading') && (!this.lastLoadTime || this.lastLoadTime < Morsel.getTimeStamp() - 60))
		{
			this.loadLists();
			this.lastLoadTime = Morsel.getTimeStamp();
		}
	},
	
	aboutToDeactivate: function()
	{
		
	},
	
	loadLists: function()
	{
		this.element.addClassName('loading');
		this.listElement.removeClassName('error').removeClassName('empty');
		this.listElement.innerHTML = "";
		this.listFooter.innerHTML = "Loading...";
		this.lists = [];
		this.activeRequests = {list: true , sub: true};
		this.account.getListsForUser({callBack: this.loadListsCallBack.bind(this , 'list') , username: this.account.username});
		this.account.getListSubscriptions({callBack: this.loadListsCallBack.bind(this , 'sub') , username: this.account.username});
		
	},
	
	loadListsCallBack: function(type , worked , data)
	{
		this.activeRequests[type] = false;
		if (!worked)
		{
			return false;
		}
		
		if (type == "list")
		{
			data.each(function(list) {
				this.lists.unshift(list);
			} , this);
		}
		else
		{
			data.each(function(list) {
				this.lists.push(list);
			} , this);
		}
		
		this.renderLists();
	},
	
	renderLists: function()
	{
		Mojo.Log.info('renderLists' , Object.toJSON(this.activeRequests));
		if (this.activeRequests.list || this.activeRequests.sub)
		{
			return false;
		}
		
		this.element.removeClassName('loading');
		
		if (this.lists.length > 0)
		{
			var html = [];
			this.lists.each(function(list) {
				html.push(Mojo.View.render({object: list , template: this.listTemplate}));
			} , this);
			this.listElement.innerHTML = html.join('');
		}
		else
		{
			this.listElement.addClassName('empty');
			this.listElement.innerHTML = Mojo.View.render({object: {} , template: this.emptyListTemplate});
		}
		
		this.listFooter.innerHTML = "Last Updated on " + new Date().format(Morsel.dateTimeFormat);
	},
	
	listsClick: function(evt)
	{
		var list;
		if (!evt.target.hasClassName('list-list-item'))
		{
			list = evt.target.up('.list-list-item');
		}
		else
		{
			list = evt.target;
		}
		
		if (!list)
		{
			return false;
		}
		var id = list.id.substr(5),
			title = list.down('.title').innerHTML;
		this.controller.push("ViewList" , {account: this.account , user: this.account , title: title , id: id});
		
	},
	
	myAccountActionsClick: function(evt)
	{
		var action;
		if (!evt.target.hasClassName('full-action-item'))
		{
			action = evt.target.up('.full-action-item');
			if (!action)
			{
				return;
			}
		}
		else
		{
			action = evt.target;
		}
		
		var title = action.down('.title');
		switch(title.innerHTML.toLowerCase())
		{
			case "view profile":
				this.controller.push("ViewUser" , {account: this.account , username: this.account.username , currentUser: true});
			break;
			
			case "view favorites":
				this.controller.push("ViewFavorites" , {account: this.account , username: this.account.username});
			break;
			
			case "retweets by me":
				this.controller.push("ViewRetweetsBy" , {account: this.account , username: this.account.username});
			break;
			
			case "retweets of me":
				this.controller.push("ViewRetweetsOf" , {account: this.account , username: this.account.username});
			break;
		}
	},
	
	readjustScrollTop: function()
	{
		if (this.element.hasClassName('show'))
		{
			this.scroller.scrollTop = 0;
		}
	}
});