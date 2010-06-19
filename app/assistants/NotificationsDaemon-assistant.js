NotificationsDaemonAssistant = Class.create({
	initialize: function(o)
	{
		this.cardName = o.cardName;
		this.accounts = [];
		this.checking = [];
		var binds = ['getAccountsCallBack' , 'showNotification'];
		binds.each(function(b) {
			this[b] = this[b].bind(this);
		} , this);
	},
	
	setup: function()
	{
		this.preferences = Twee.Preferences.getNotifications();
		this.checkingText = this.controller.get('checking');
		this.updateCheckingText();
		Twee.AccountManager.getAccounts(this.getAccountsCallBack);
	},
	
	updateCheckingText: function()
	{
		var text = "";
		if (this.preferences.timeline)
		{
			this.checking.push('timeline');
		}
		if (this.preferences.mentions)
		{
			this.checking.push('mentions');
		}
		if (this.preferences.messages)
		{
			this.checking.push('messages');
		}
		
		if (this.checking.length == 0)
		{
			text = "nothing";
		}
		else if (this.checking.length == 1)
		{
			text = this.checking[0];
		}
		else if (this.checking.length == 2)
		{
			text = this.checking[0] + " and " + this.checking[1];
		}
		else if (this.checking.length == 3)
		{
			text =  this.checking[0] + ", " + this.checking[1] + ", and " + this.checking[2];
		}
		this.checkingText.innerHTML = text;
	},
	
	getAccountsCallBack: function(accounts)
	{
		if (accounts.length > 0)
		{
			accounts.each(function(account) {
				account.checked = {};
			} , this);
			this.accounts = accounts;
			this.startNextAccount();
		}
		else
		{
			window.setTimeout(this.close.bind(this) , 256);
		}
	},
	
	startNextAccount: function()
	{
		this.nextNotificationsFor(this.accounts[0] , $A(this.checking));
	},
	
	accountFinish: function(account , skip)
	{
		skip = skip || false;
		if (!skip)
		{
			this.showNotificationFor(account);
		}
		this.accounts = this.accounts.without(account);
		if (this.accounts.length == 0)
		{
			Twee.Notifications.enable();
			this.close();
		}
		else
		{
			this.startNextAccount();
		}
	},
	
	nextNotificationsFor: function(account , check)
	{
		if (check.length == 0)
		{
			return this.accountFinish(account);
		}
		
		account.getTweets(check[0] + "-view" , this.getAccountStoredCallBack.bind(this , account , check));
	},
	
	getAccountStoredCallBack: function(account , check , data)
	{
		if (!account || !account.getForList)
		{
			this.accountFinish(account , true);
		}
		
		var since_id = 0;
		if (data.length > 0)
		{
			since_id = data[0].id;
		}
		
		account.getForList(check[0] + "-view" , {since_id: since_id , callBack: this.getNewAccountTweets.bind(this , account , check)});
	},
	
	getNewAccountTweets: function(account , check , worked , data)
	{
		account.checked[check[0]] = (worked ? data.length : 0);
		window.setTimeout(this.nextNotificationsFor.bind(this , account , check.without(check[0])) , 10);
	},
	
	showNotificationFor: function(account)
	{
		var total = 0;
		for(var i in account.checked) if (account.checked.hasOwnProperty(i))
		{
			total += account.checked[i];
		}
		
		if (total > 0)
		{
			var cardName = Twee.getNotificationCardForUser(account),
				stage = Twee.StageManager.getStage(cardName),
				scene = false;
			if (stage)
			{
				scene = stage.activeScene();
				if (scene && scene.assistant && scene.assistant.close)
				{
					scene.assistant.close();
				}
			}
			
			window.setTimeout(this.showNotification.bind(this , cardName , {
				account: account,
				count: total
			}) , 0);
		}
	},
	
	showNotification: function(cardName , o)
	{
		if (!this.lastNotificationTimestamp || this.lastNotificationTimestamp < Morsel.getTimeStamp() - 60)
		{
			this.lastNotificationTimestamp = Morsel.getTimeStamp();
			if (this.preferences.sound)
			{
				Mojo.Controller.getAppController().playSoundNotification('media' , 'changeSound.mp3');
			}
			if (this.preferences.vibrate)
			{
				this.vibrateNotification(3);
			}
		}
		Twee.StageManager.newDashboard(cardName , 'NotificationDashboard' , o);
	},
	
	vibrateNotification: function(times)
	{
		if (!times) return false;
		Mojo.Controller.getAppController().playSoundNotification('vibrate' , '');
		window.setTimeout(this.vibrateNotification.bind(this , --times) , 400)
	},
	
	close: function()
	{
		this.controller.window.close();
	}
});