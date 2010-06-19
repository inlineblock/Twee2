Twee.ControlGrid = Class.create({
	actionClassName: 'action',
	displayToggleClassName: 'toggle',
	initialize: function(el)
	{
		this.observing = [];
		this.controlGridClick = this.controlGridClick.bind(this);
		this.element = el;
		this.setup();
	},
	
	setup: function()
	{
		this.toggle = this.element.down('toggle');
		this.element.observe(Mojo.Event.tap , this.controlGridClick);
	},
	
	cleanup: function()
	{
		this.element.stopObserving(Mojo.Event.tap , this.controlGridClick);
	},
	
	controlGridClick: function(evt)
	{
		var el = evt.target;
		if (!el.hasClassName(this.actionClassName))
		{
			el = el.up("." + this.actionClassName);
			if (!el)
			{
				return false;
			}
		}
		if (el.hasClassName(this.displayToggleClassName))
		{
			return this.toggleDisplay();
		}
		
		this.fireEvent({action: el.innerHTML.toLowerCase() , timestamp: new Date().getTime()});
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
	
	toggleDisplay: function()
	{
		if (this.element.hasClassName('open'))
		{
			this.element.removeClassName('open');
		}
		else
		{
			this.element.addClassName('open');
		}
	}
});