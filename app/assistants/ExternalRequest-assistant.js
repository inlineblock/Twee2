ExternalRequestAssistant = Class.create(Twee.Base , {
	Binds: ['getAccountsCallBack' , 'close' , 'accountListTap' , 'followUserCallBack'],
	setup: function($super)
	{
		this.altBackground();
		$super();
		
		this.infoArea = this.get('info-area');
		this.frameWrapper = this.get('frame-wrapper');
		this.accountsList = this.get('accounts-list');
		this.accountsList.observe(Mojo.Event.tap , this.accountListTap);
		
		var mainHdr = this.get('main-hdr');
		if (this.options.follow)
		{
			this.follow = (this.options.follow.substr(0 , 1) == "@" ? this.options.follow.substr(1) : this.options.follow);
			mainHdr.innerHTML = "Follow @" + this.follow.escapeHTML();
			this.infoArea.innerHTML = Mojo.View.render({object: {follow: this.follow.escapeHTML()} , template: "ExternalRequest/follow"});
		}
		else if (this.options.tweet)
		{
			mainHdr.innerHTML = "Send New Tweet";
			this.tweet = this.options.tweet.substr(0 , 140);
			
			this.infoArea.innerHTML = Mojo.View.render({object: {tweet: this.tweet} , template: "ExternalRequest/tweet"});
		}
		
		Twee.AccountManager.getAccounts(this.getAccountsCallBack);
		this.showLoading("Loading Accounts...");
		this.frameWrapper.addClassName("loading");
	},
	
	activate: function(o)
	{
		o = o || {};
		if (o.refreshTimeline)
		{
			this.close();
		}
	},
	
	cleanup: function($super)
	{
		this.accountsList.stopObserving(Mojo.Event.tap , this.accountListTap);
		$super();
	},
	
	getAccountsCallBack: function(accounts)
	{
		this.hideLoading();
		if (accounts.length > 0)
		{
			this.frameWrapper.removeClassName("loading");
			
			var html = [];
			accounts.each(function(acct) {
				html.push(Mojo.View.render({object: acct , template: "ManageAccounts/account"}));
			} , this);
			this.accountsList.innerHTML = html.join('');
			this.accounts = accounts;
			
		}
		else
		{
			this.errorDialog("Twee does not have any user accounts." , this.close);
		}
	},
	
	accountListTap: function(evt)
	{
		var el = evt.target;
		if (!el.hasClassName('account'))
		{
			el = el.up('.account');
		}
		
		if (!el) 
		{
			return false;
		}
		
		var id = el.id.substr(8),
			account = this.getAccountForId(id);
		if (!account)
		{
			return false;
		}
		
		if (this.follow)
		{
			this.showLoading("Following...");
			account.followUser({callBack: this.followUserCallBack , screen_name: this.follow});
		}
		else if (this.tweet)
		{
			this.push('NewTweet' , {account: account , text: this.tweet});
		}
		else
		{
			this.close();
		}
		
	},
	
	getAccountForId: function(id)
	{
		for(var i=0; i < this.accounts.length; i++)
		{
			if (this.accounts[i].id == id)
			{
				return this.accounts[i];
			}
		}
		return false;
	},
	
	followUserCallBack: function(worked , error)
	{
		if (!worked)
		{
			this.hideLoading();
			this.errorDialog(error || "Unable to follow {username} user at this time.".replace("{username}" , this.follow.escapeHTML()));
		}
		else
		{
			this.showBanner("You are now following @" + this.follow.escapeHTML() + "!");
			this.close();
		}
	},
	
	close: function()
	{
		this.controller.window.close();
	}
});