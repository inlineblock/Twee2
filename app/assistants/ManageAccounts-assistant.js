ManageAccountsAssistant = Class.create(Twee.Base , {
	Binds: [
				'loadAccountsCallBack',
				'accountClick',
				'accountDelete',
				'addAccountClick'
			],
	
	setup: function($super)
	{
		$super();
		this.userAccounts = this.get('user-accounts');
		this.addAccount = this.get('add-account');
	
		this.accountListModel = {listTitle: '' , items: []};
		this.controller.setupWidget('user-accounts' , {itemTemplate: 'ManageAccounts/account' , listTemplate: 'ManageAccounts/container' , swipeToDelete: true , emptyTemplate: 'ManageAccounts/empty'} , this.accountListModel);
		
		this.userAccounts.observe(Mojo.Event.listTap , this.accountClick);
		this.userAccounts.observe(Mojo.Event.listDelete , this.accountDelete);
		this.addAccount.observe(Mojo.Event.tap , this.addAccountClick);
		this.showLoading();
	},
	
	activate: function()
	{
		Twee.AccountManager.getAccounts(this.loadAccountsCallBack);
	},
	
	deactivate: function()
	{
		
	},
	
	cleanup: function($super)
	{
		$super();
	},
	
	loadAccountsCallBack: function(accts)
	{
		this.accountListModel.items = accts;
		this.controller.modelChanged(this.accountListModel);
		if (this.accountListModel.items.length < 1)
		{
			if (this.options.initialLaunch)
			{
				this.firstTime();
			}
			this.renderEmptyTemplate();
		}
		else if (this.accountListModel.items.length === 1)
		{
			if (this.options.initialLaunch)
			{
				this.loadCardForAccount(this.accountListModel.items[0]);
			}
		}
		this.options.initialLaunch = false;
		this.hideLoading();
	},
	
	renderEmptyTemplate: function()
	{
		this.userAccounts.mojo.setLength(0);
	},
	
	accountClick: function(evt)
	{
		this.loadCardForAccount(evt.item);
	},
	
	accountDelete: function(evt)
	{
		evt.item.destroy();
		this.accountListModel.items = this.accountListModel.items.without(evt.item);
		if (this.accountListModel.items.length === 0)
		{
			this.renderEmptyTemplate();
		}
	},
	
	addAccountClick: function(evt)
	{
		this.push('AddAccount');
	},
	
	loadCardForAccount: function(acct)
	{
		if (Twee.userCardExists(acct))
		{
			var card = Twee.getCardForUser(acct);
			Twee.StageManager.newCard(card , 'Main' , {account: acct});
		}
		else
		{
			Twee.swapManageAccountWithUser(acct);
			this.swap({name: 'Main' , transition: Mojo.Transition.crossFade} , {account: acct});
		}
	},
	
	firstTime: function()
	{
	
	}
});