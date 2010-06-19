Twee = {
		
	consumerKey: ["\x38\x59\x62\x46\x57\x55\x66\x65\x70\x77\x4E\x50\x72\x50\x52\x69\x58\x31\x6B\x4F\x45\x67"][0],
	consumerSecret: ["\x4C\x75\x68\x48\x6D\x72\x32\x42\x67\x41\x78\x36\x35\x47\x4D\x62\x30\x62\x50\x47\x63\x32\x4F\x57\x75\x73\x53\x79\x46\x62\x37\x39\x6D\x4C\x33\x36\x36\x31\x6B"][0],
	
	twitpicKey: 'c548833162f007b88e3343da700895e5',

	createNightShade: function(text)
	{
		var ns = new Element('div' , {className: 'nightShade'});
		var spinner = new Element('div' , {className:"activity-spinner palm-activity-indicator-small" , xMojoElement:"Spinner"});
		spinner.identify();
		ns.appendChild(spinner);
		ns.innerHTML += text;
		return ns;
	},
	openCards: [],
	cardPrefix: 'card-',
	userCardPrefix: 'user-',
	userNotificationPrefix: 'noti-',
	userListCard: 'userListCard',
	checkingForNotificationsCard: 'checkingForNotifications',
	cardCounter: 0,
	// open card style {name: 'card-3' , meta: 'user-eekfuh'} or {name: 'card-3' , meta: 'users'}
	
	cleanOpenCards: function()
	{
		this.openCards.each(function(card) {
			var cardName = card.name;
			if (!Twee.StageManager.stageExists(cardName))
			{
				Twee.openCards = Twee.openCards.without(cardName);
			}
		} , this);
	},
	
	getBlankCardNumber: function()
	{
		Twee.cardCounter = Twee.cardCounter + 1;
		return Twee.cardCounter;
	},
	
	getUsersCard: function()
	{
		Twee.cleanOpenCards();
	},
	
	getCardWithMeta: function(meta_name)
	{
		for(var i=0; i < Twee.openCards.length; i++)
		{
			if (meta_name == Twee.openCards[i].meta)
			{
				return Twee.openCards[i];
			}
		}
		return false;
	},
	
	getManageAccountCard: function()
	{
		Twee.cleanOpenCards();
		var meta_name = Twee.userListCard,
			card = Twee.getCardWithMeta(meta_name);
		if (card)
		{
			return card.name;
		}
		else
		{
			var number = Twee.getBlankCardNumber();
			card = {name: Twee.cardPrefix + number , meta: meta_name};
			Twee.openCards.push(card);
			return card.name;
		}
	},
	
	getCheckingForNotificationCard: function()
	{
		Twee.cleanOpenCards();
		var meta_name = Twee.checkingForNotificationsCard,
			card = Twee.getCardWithMeta(meta_name);
		if (card)
		{
			return card.name;
		}
		else
		{
			var number = Twee.getBlankCardNumber();
			card = {name: Twee.cardPrefix + number , meta: meta_name};
			Twee.openCards.push(card);
			return card.name;
		}
	},
	
	getCardForUser: function(user)
	{
		Twee.cleanOpenCards();
		var meta_name = Twee.userCardPrefix + user.username,
			card = Twee.getCardWithMeta(meta_name);
		if (card)
		{
			return card.name;
		}
		else
		{
			var number = Twee.getBlankCardNumber();
			card = {name: Twee.cardPrefix + number , meta: meta_name};
			Twee.openCards.push(card);
			return card.name;
		}
	},
	
	userCardExists: function(user)
	{
		Twee.cleanOpenCards();
		var meta_name = Twee.userCardPrefix + user.username,
			card = Twee.getCardWithMeta(meta_name);
		return (card ? true : false);
	},
	
	userNotificationCardExists: function(user)
	{
		Twee.cleanOpenCards();
		var meta_name = Twee.userNotificationPrefix + user.username,
			card = Twee.getCardWithMeta(meta_name);
		return (card ? true : false);
	},
	
	getNotificationCardForUser: function(user)
	{
		Twee.cleanOpenCards();
		var meta_name = Twee.userNotificationPrefix + user.username,
			card = Twee.getCardWithMeta(meta_name);
		if (card)
		{
			return card.name;
		}
		else
		{
			var number = Twee.getBlankCardNumber();
			card = {name: Twee.cardPrefix + number , meta: meta_name};
			Twee.openCards.push(card);
			return card.name;
		}
		
	},
	
	swapManageAccountWithUser: function(user)
	{
		Twee.cleanOpenCards();
		var meta_name = Twee.userListCard,
			card = Twee.getCardWithMeta(meta_name);
		
		if (!card)
		{
			return false;
		}
		card.meta = Twee.userCardPrefix + user.username;
	}
};