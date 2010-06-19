AppAssistant = Class.create({
	
	setup: function()
	{
		Twee.StageManager = new Morsel.StageManager(this.controller);
	},
	
	handleLaunch: function(o)
	{
		o = o || {};
		Mojo.Log.info('handleLaunch' , Object.toJSON(o));
		
		if (o.notifications)
		{
			var card = Twee.getCheckingForNotificationCard();
			Twee.StageManager.newDashboard(card , 'NotificationsDaemon' , {cardName: card});
		}
		else if (o.tweet)
		{
			var card = Twee.getUnusedCard();
			Twee.StageManager.newCard(card , 'ExternalRequest' , {tweet: o.tweet});
		}
		else if (o.follow)
		{
			var card = Twee.getUnusedCard();
			Twee.StageManager.newCard(card , 'ExternalRequest' , {follow: o.follow});
		}
		else
		{
			var card = Twee.getManageAccountCard();
			Twee.StageManager.newCard(card , 'ManageAccounts' , {initialLaunch: true});
		}
	}
});