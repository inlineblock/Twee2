NotificationDashboardAssistant = Class.create({
	initialize: function(o)
	{
		this.options = o || {};
		this.account = this.options.account;
		this.counts = this.account.checked;
		delete this.account.checked;
		this.onClick = this.onClick.bind(this);
	},
	
	setup: function()
	{
		this.count = this.controller.get('count');
		this.title = this.controller.get('title');
		this.text = this.controller.get('text');
		
		this.count.innerHTML = this.options.count;
		this.title.innerHTML = "@{username}".replace("{username}" , this.options.account.username);
		this.text.innerHTML = this.buildText();
		
		this.controller.sceneElement.observe(Mojo.Event.tap, this.onClick);
	},
	
	cleanup: function()
	{
		this.controller.sceneElement.stopObserving(Mojo.Event.tap, this.onClick);
	},
	
	buildText: function()
	{
		var text = "New ",
			first = false;
		if (this.counts.timeline > 0)
		{
			first = true;
			text += "timeline ";
		}
		
		if (this.counts.mentions > 0)
		{
			if (first)
			{
				text += " and mentions";
			}
			else
			{
				first = true;
				text += "mentions"
			}
		}
		
		if (this.counts.messages > 0)
		{
			if (first)
			{
				text += " and messages";
			}
			else
			{
				first = true;
				text += "messages"
			}
		}
		
		if (!first)
		{
			text += "alerts";
		}
		return text;
	},
	
	onClick: function()
	{
		var switchToScene;
		if (this.counts)
		{
			if (this.counts.messages > 0)
			{
				switchToScene = 'messages';
			}
			else if (this.counts.mentions > 0)
			{
				switchToScene = 'mentions';
			}
			else
			{
				switchToScene = 'timeline';
			}
		}
		var cardName = Twee.getCardForUser(this.account),
			stage = Twee.StageManager.getStage(cardName),
			scene = false;
		if (stage)
		{
			scene = stage.activeScene();
			if (scene && scene.assistant && scene.assistant.switchTo)
			{
				scene.assistant.switchTo(switchToScene);
				this.close();
				stage.window.focus();
				return;
			}
		}
		Twee.StageManager.newCard(cardName , "Main" , {account: this.account , subView: switchToScene});
		this.close();
	},
	
	close: function()
	{
		this.controller.window.close();
	}
});