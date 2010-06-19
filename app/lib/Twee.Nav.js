Twee.Nav = Class.create({
	activeClassName: 'highlight',
	tabClassName: 'nav-item',
	readyClassName: 'ready',
	lightClassName: 'light',
	initialize: function(el , view)
	{
		this.tabBarClick = this.tabBarClick.bind(this);
		this.observing = [];
		this.element = el;
		this.lastChange = false;
		this.setup();
		this.activateTab(view , true);
	},
	
	setup: function()
	{
		this.highlighter = this.element.down('#highlighter');
		this.tabs = this.element.getElementsBySelector('li.' + this.tabClassName);
		this.element.observe(Mojo.Event.tap , this.tabBarClick);
	},
	
	cleanup: function()
	{
		this.element.stopObserving(Mojo.Event.tap , this.tabBarClick);
	},
	
	observe: function(type , callBack)
	{
		// type is ignored, cause i'm lazy
		this.observing.push(callBack);
	},
	
	stopObserving: function(type , callBack)
	{
		// still lazy, only have one event "change"
		this.observing = this.observing.without(callBack);
	},
	
	fireEvent: function(evt)
	{
		this.observing.each(function(cB) {
			cB(evt);
		}, this);
	},
	
	activateTab: function(activate , skipEvent)
	{
		this.tabs.each(function(tab) {
			if (tab.hasClassName(activate))
			{
				if (tab.hasClassName(this.lightClassName))
				{
					tab.removeClassName(this.lightClassName);
				}
				tab.addClassName(this.activeClassName);
				this.highlighter.setStyle({
					left: ((tab.offsetLeft + (tab.getWidth()/2)) - (this.highlighter.getWidth()/2)) + 'px'
				});
				
				if (!skipEvent)
				{
					this.fireEvent({
						element: tab,
						name: activate,
						timestamp: Morsel.getTimeStamp()
					});
				}
			}
			else
			{
				if (tab.hasClassName(this.activeClassName))
				{
					tab.removeClassName(this.activeClassName);
				}
			}
		}, this);
	},
	
	orientationChange: function()
	{
		this.highlighter.removeClassName(this.readyClassName);
		this.tabs.each(function(tab) {
			if (tab.hasClassName(this.activeClassName))
			{
				this.highlighter.setStyle({
					left: ((tab.offsetLeft + (tab.getWidth()/2)) - (this.highlighter.getWidth()/2)) + 'px'
				});
			}
		} , this);
	},
	
	tabBarClick: function(evt)
	{
		if (this.lastChange && (new Date().getTime() - this.lastChange) < 300)
		{
			return;
		}
		
		this.highlighter.addClassName(this.readyClassName);
		var el = evt.target;
		if (!el.hasClassName(this.tabClassName) || el.hasClassName(this.activeClassName))
		{
			if (el.tagName.toLowerCase() == "b")
			{
				el = el.up('.' + this.tabClassName);
			}
			else
			{
				return;
			}
		}
		this.activateTab(el.readAttribute('for'));
		this.lastChange = new Date().getTime();
	},
	
	fireLight: function(name)
	{
		Mojo.Log.info('fireLight' , name);
		this.tabs.each(function(tab) {
			if (tab.hasClassName(name))
			{
				tab.addClassName(this.lightClassName);
				var className = this.lightClassName;
				window.setTimeout(function() {
					Mojo.Log.info("remove" , className);
					tab.removeClassName(className);
				} , 1500);
			}
		} , this);
	},
	
	addLight: function(name)
	{
		this.tabs.each(function(tab) {
			if (tab.hasClassName(name))
			{
				tab.addClassName(this.lightClassName);
			}
		} , this);
	}

});