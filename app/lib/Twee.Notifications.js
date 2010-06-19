Twee.Notifications = new (Class.create({
	
	initialize: function()
	{
		this.key = "notificationsDaemon";
	},
	
	changed: function(o)
	{
		o = o || {};
		if (!o.enabled)
		{
			this.disable();
		}
		else
		{
			this.enable();
		}
	},
	
	disable: function()
	{
		new Mojo.Service.Request('palm://com.palm.power/timeout', {
			method: "clear",
			parameters: {key: this.key },
			onSuccess: Mojo.doNothing,
			onFailure: Mojo.doNothing
		});
	},
	
	enable: function()
	{
		var o = Twee.Preferences.getNotifications(),
			alarm = new Date((new Date().getTime() + (o.interval * 60 * 1000)));
		if (!o.enabled || (!o.timeline && !o.mentions && !o.messages))
		{
			this.disable();
			return false;
		}
		
		new Mojo.Service.Request('palm://com.palm.power/timeout', {
			method: "set",
			parameters: {
				wakeup: true,
				key: this.key,
				uri: "palm://com.palm.applicationManager/launch",
				params: {
					id: Mojo.Controller.appInfo.id,
					params: {
						notifications: true
					}
				},
				at: Morsel.convertDateToAlarm(alarm)
			},
			onSuccess: Mojo.doNothing,
			onFailure: Mojo.doNothing
		});
	}
}));