ViewFavoritesAssistant = Class.create(Twee.Base , {
	setup: function($super)
	{
		this.account = this.options.account;
		this.username = this.options.username;
		$super();
		this.altBackground();
		var mainhdr = this.get('main-hdr');
		mainhdr.innerHTML = "@{username}'s Favorites".replace("{username}" , this.options.username.escapeHTML());
		
		this.list = new Twee.FavoritesList({controller: this , account: this.account , scroller: this.scroller}).setup("favorites-view");
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