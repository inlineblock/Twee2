ViewListAssistant = Class.create(Twee.Base , {
	setup: function($super)
	{
		this.account = this.options.account;
		this.username = this.options.title.split('/')[0].substr(1);
		this.id = this.options.id;
		$super();
		this.altBackground();
		var mainhdr = this.get('main-hdr');
		mainhdr.innerHTML = this.options.title.escapeHTML();
		
		this.list = new Twee.ListStatusesList({controller: this , account: this.account , scroller: this.scroller}).setup("list-statuses-view");
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