ViewUserSearchAssistant = Class.create(Twee.Base , {
	setup: function($super)
	{
		this.search = this.options.search;
		this.account = this.options.account;
		$super();
		this.altBackground();
		var mainhdr = this.get('main-hdr');
		mainhdr.innerHTML = this.options.search.escapeHTML();
		
		this.list = new Twee.UserSearchList({controller: this , account: this.account , scroller: this.scroller}).setup("user-search-view");
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