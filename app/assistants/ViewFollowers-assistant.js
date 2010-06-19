ViewFollowersAssistant = Class.create(Twee.Base , {
	setup: function($super)
	{
		this.username = this.options.username;
		this.account = this.options.account;
		$super();
		this.altBackground();
		var mainhdr = this.get('main-hdr');
		mainhdr.innerHTML = this.options.username.escapeHTML();
		
		this.list = new Twee.UserList({controller: this , account: this.account , scroller: this.scroller}).setup("followers-view");
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
	}
});