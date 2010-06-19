ViewConversationAssistant = Class.create(Twee.Base , {
	setup: function($super)
	{
		$super();
		this.altBackground();
		
		this.list = new Twee.ConversationList({controller: this , account: this.account , scroller: this.scroller}).setup("conversation-view");
		this.list.element.addClassName('show');
	},
	
	activate: function()
	{
		//this.list.aboutToActivate();
		//this.list.activate();
	},
	
	cleanup: function($super)
	{
		this.list.cleanup();
		$super();
	},
});