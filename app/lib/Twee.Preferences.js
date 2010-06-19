Twee.Preferences = new (Class.create({
	fontSizes: ['small' , 'medium' , 'large'],
	fontSizeClassPostfix: '-font',
	initialize: function()
	{
		this.cookie = new Mojo.Model.Cookie('Twee.Preferences');
		this.settings = this.cookie.get() || {};
	},
	
	save: function()
	{
		this.cookie.put(this.settings);
	},
	
	getSettings: function()
	{
		return this.settings;
	},
	
	setSettings: function(o)
	{
		this.settings = o;
		this.save();
	},
	
	getLocation: function()
	{
		var location = this.settings.location || {};
		location.auto = location.auto || false;
		return location;
	},
	
	setLocation: function(location)
	{
		location = location || {};
		location.auto = location.auto || false;
		this.settings.location = location;
		this.save();
	},
	
	getFontSize: function()
	{
		var o = this.settings.fontSize || 'medium';
		switch(o)
		{
			case 'small':
				return 'small';
			break;
			
			case 'large':
				return 'large';
			break;
			
			default:
			case 'medium':
				return 'medium';
			break;
		}
	},
	
	setFontSize: function(o)
	{
		switch(o)
		{
			case 'small':
				this.settings.fontSize = 'small';
			break;
			
			case 'large':
				this.settings.fontSize = 'large';
			break;
						
			default:
			case 'medium':
				this.settings.fontSize = 'medium';
			break;
		}
		
		this.save();
	},
	
	getPhotoProvider: function()
	{
		var scr = this.settings.photoProvider || 'imgly';
		switch(scr)
		{
			case 'yfrog':
				return 'yfrog';
			break;
			
			case 'twitpic':
				return 'twitpic';
			break;
			
			case 'imgly':
			default:
				return 'imgly';
			break;
		}
	},
	
	setPhotoProvider: function(p)
	{
		switch(p)
		{
			case 'yfrog':
				this.settings.photoProvider = 'yfrog';
			break;
			
			case 'imgly':
				this.settings.photoProvider = 'imgly';
			break;
			
			case 'twitpic':
			default:
				this.settings.photoProvider = 'twitpic';
			break;
		}
		this.save();
	},
	
	getRotation: function()
	{
		if (typeof(this.settings.rotation) == "undefined")
		{
			this.settings.rotation = true;
		}
		return (this.settings.rotation || false);
	},
	
	setRotation: function(r)
	{
		this.settings.rotation = (r ? true : false);
		this.save();
	},
	
	getNotifications: function()
	{
		var o = this.settings.notifications || {enabled: false , interval: 15 , vibrate: true , sound: true , timeline: false , mentions: true , messages: true};
		return o;
	},
	
	setNotifications: function(o)
	{
		o = o || {};
		o.enabled = (o.enabled ? true : false);
		o.vibrate = (o.vibrate ? true : false);
		o.sound = (o.sound ? true : false);
		o.timeline = (o.timeline ? true : false);
		o.mentions = (o.mentions ? true : false);
		o.messages = (o.messages ? true : false);
		switch(parseInt(o.interval))
		{
			case 5:
				o.interval = 5;
			break;
			
			case 30:
				o.interval = 30;
			break;
			
			case 60:
				o.interval = 60;
			break;
			
			case 120:
				o.interval = 120;
			break;
			
			case 240:
				o.interval = 240;
			break;
			
			case 480:
				o.interval = 480;
			break;
			
			case 15:
			default:
				o.interval = 15;
			break;
		}
		this.settings.notifications = o;
		this.save();
		
		Twee.Notifications.changed(o);
	},
	
	applyFontSize: function(body)
	{
		this.removeAllClasses(body);
		var size = this.getFontSize();
		body.addClassName(size + this.fontSizeClassPostfix);
	},
	
	removeAllClasses: function(body)
	{
		this.fontSizes.each(function(size) {
			body.removeClassName(size + this.fontSizeClassPostfix);
		} , this);
	}
	
}))();