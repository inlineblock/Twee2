PreferencesAssistant = Class.create(Twee.Base , {
	Binds: ['settingsChange' , 'notificationsChange' , 'fontSizeChange' , 'autoLocationChange' , 'autoLocationPrompt'],
	setup: function($super)
	{
		this.altBackground();
		$super();
		
		this.fontSizeChoices = [{label : 'Small', value: 'small'},{label : 'Medium', value : 'medium'},{label : 'Large', value : 'large'}];
		this.fontSizeModel = {value: Twee.Preferences.getFontSize()};
		this.controller.setupWidget('fontSizeSelector', {label: $L("Font Size") , choices: this.fontSizeChoices} , this.fontSizeModel);
		this.get('fontSizeSelector').observe(Mojo.Event.propertyChange , this.fontSizeChange);
		
		
		this.photoProviderChoices = [{label : 'TwitPic', value : 'twitpic'},{label : 'YFrog', value : 'yfrog'},{label : 'Img.ly', value : 'imgly'}];
		this.photoProviderModel = {value: Twee.Preferences.getPhotoProvider()};
		this.controller.setupWidget('photoProviderSelector', {label: $L('Service'), choices: this.photoProviderChoices}, this.photoProviderModel);
		
		this.rotationToggleModel = { value: Twee.Preferences.getRotation()};
		this.controller.setupWidget('rotationToggle' , { trueValue: true , falseValue: false } , this.rotationToggleModel);
		
		this.autoLocationModel = { value: Twee.Preferences.getLocation().auto};
		this.controller.setupWidget('autoLocationToggle' , { trueValue: true , falseValue: false } , this.autoLocationModel);
		this.get('autoLocationToggle').observe(Mojo.Event.propertyChange , this.autoLocationChange);
		
		['photoProviderSelector' , 'rotationToggle' , 'autoLocationToggle'].each(function(name) {
			this.get(name).observe(Mojo.Event.propertyChange , this.settingsChange);
		} , this);
		
				
		
		var not = Twee.Preferences.getNotifications();
		this.notificationsEnabledModel = { value: not.enabled};
		this.controller.setupWidget('notificationsEnabled' , { trueValue: true , falseValue: false } , this.notificationsEnabledModel);
		this.notificationsSoundModel = { value: not.sound};
		this.controller.setupWidget('notificationsSound' , { trueValue: true , falseValue: false } , this.notificationsSoundModel);
		this.notificationsVibrateModel = { value: not.vibrate};
		this.controller.setupWidget('notificationsVibrate' , { trueValue: true , falseValue: false } , this.notificationsVibrateModel);
		this.notificationsTimelineModel = { value: not.timeline};
		this.controller.setupWidget('notificationsTimeline' , { trueValue: true , falseValue: false } , this.notificationsTimelineModel);
		this.notificationsMentionsModel = { value: not.mentions};
		this.controller.setupWidget('notificationsMentions' , { trueValue: true , falseValue: false } , this.notificationsMentionsModel);
		this.notificationsMessagesModel = { value: not.messages};
		this.controller.setupWidget('notificationsMessages' , { trueValue: true , falseValue: false } , this.notificationsMessagesModel);
		this.notificationsIntervalChoices = [
			{label : '5 Minutes', value : 5},
			{label : '15 Minutes', value : 15},
			{label : '30 Minutes', value : 30},
			{label : '1 Hour', value : 60},
			{label : '2 Hours', value : 120},
			{label : '4 Hours', value : 240},
			{label : '8 Hours', value : 480}
		];
		this.notificationsIntervalModel = {value: not.interval};
		this.controller.setupWidget('notificationsInterval', {label: $L('Interval'), choices: this.notificationsIntervalChoices}, this.notificationsIntervalModel);
		
		
		['notificationsEnabled' , 'notificationsSound' , 'notificationsVibrate' , 'notificationsTimeline' , 'notificationsMentions' , 'notificationsMessages' , 'notificationsInterval'].each(function(name) {
			this.get(name).observe(Mojo.Event.propertyChange , this.notificationsChange);
		} , this);

		this.notificationsGroup = this.get('notifications-group');
		if (not.enabled)
		{
			this.notificationsGroup.addClassName('show');
		}
		else
		{
			this.notificationsGroup.removeClassName('show');
		}
	},
	
	cleanup: function($super)
	{
		this.get('fontSizeSelector').stopObserving(Mojo.Event.propertyChange , this.fontSizeChange);
		this.get('autoLocationToggle').stopObserving(Mojo.Event.propertyChange , this.autoLocationChange);
		['photoProviderSelector' , 'rotationToggle' , 'autoLocationToggle'].each(function(name) {
			this.get(name).stopObserving(Mojo.Event.propertyChange , this.settingsChange);
		} , this);
		
		['notificationsEnabled' , 'notificationsSound' , 'notificationsVibrate' , 'notificationsTimeline' , 'notificationsMentions' , 'notificationsMessages' , 'notificationsInterval'].each(function(name) {
			this.get(name).stopObserving(Mojo.Event.propertyChange , this.notificationsChange);
		} , this);
		$super();
	},
	
	fontSizeChange: function()
	{
		Mojo.Log.info("fontSizeChange");
		Twee.Preferences.setFontSize(this.fontSizeModel.value);
		this.applyFontSize();
	},
	
	autoLocationChange: function()
	{
		Twee.Preferences.setLocation({auto: this.autoLocationModel.value});
		if (this.autoLocationModel.value)
		{	
			this.controller.showAlertDialog({
				    onChoose: this.autoLocationPrompt ,
				    title: "Auto-Geotagging",
				    message: "Twee will now automatically geotag your tweets, however geotagging will not work unless you have configured your Twitter account to share location information.",
				    choices:[
						{label:$L('Configure Twitter Account') , value: 1 , type: 'primary'},
						{label:$L('continue') , value: 0 , type: 'dismiss'}
			]});
		}
		
		
	},
	
	autoLocationPrompt: function(r)
	{
		if (r == 1)
		{
			this.openBrowser("http://twitter.com/account/geo");
		}
	},
	
	settingsChange: function()
	{
		
		Twee.Preferences.setPhotoProvider(this.photoProviderModel.value)
		Twee.Preferences.setRotation(this.rotationToggleModel.value);
		
		
		if (!this.rotationToggleModel.value)
		{
			this.controller.window.PalmSystem.setWindowOrientation("up");
		}
	},
	
	notificationsChange: function()
	{
		if (this.notificationsEnabledModel.value)
		{
			this.notificationsGroup.addClassName('show');
		}
		else
		{
			this.notificationsGroup.removeClassName('show');
		}
		
		Twee.Preferences.setNotifications({
			enabled: this.notificationsEnabledModel.value , 
			interval: this.notificationsIntervalModel.value , 
			vibrate: this.notificationsVibrateModel.value , 
			sound: this.notificationsSoundModel.value , 
			timeline: this.notificationsTimelineModel.value , 
			mentions: this.notificationsMentionsModel.value , 
			messages: this.notificationsMessagesModel.value
		});
	}
});