Twee.Base = Class.create({
	Binds: [],
	DefaultMenuItems: [{label: "Twitter's Status" , command: 'api-status' }],
	initialize: function(o)
	{
		this.options = o || {};
		if (this.options.account)
		{
			this.account = this.options.account;
		}
		this.Binds.each(function(n) {
			if (this[n])
			{
				this[n] = this[n].bind(this);
			}
		}, this);
	},
	
	setup: function()
	{
		this.scroller = this.controller.getSceneScroller();
		this.body = this.scroller.up('body');
		var menuItems = $A(this.DefaultMenuItems);
		if (this.Menu && Object.isArray(this.Menu))
		{
			menuItems.push($A(this.Menu));
			menuItems = menuItems.flatten();
		}
		this.controller.setupWidget(Mojo.Menu.appMenu , {} , {visible: true , items: menuItems});
		this.setupScroll();
		
		this.deactivateWindow = this.deactivateWindow.bind(this);
		this.controller.stageController.document.observe(Mojo.Event.stageDeactivate, this.deactivateWindow);
	},
	
	cleanup: function()
	{
		this.cleanupScroll();
		this.controller.stageController.document.stopObserving(Mojo.Event.stageDeactivate, this.deactivateWindow);
	},
	
	deactivateWindow: function(event)
	{
		Twee.Notifications.enable();
	},
	
	applyFontSize: function()
	{
		Twee.Preferences.applyFontSize(this.body);
	},
	
	get: function(el)
	{
		return this.controller.get(el);
	},
	
	push: function()
	{
		this.controller.stageController.pushScene.apply(this.controller.stageController , $A(arguments));
	},
	
	pop: function()
	{
		this.controller.stageController.popScene.apply(this.controller.stageController , $A(arguments));
	},
	
	swap: function()
	{
		this.controller.stageController.swapScene.apply(this.controller.stageController , $A(arguments));
	},
	
	normalBackground: function()
	{
		this.controller.getSceneScroller().removeClassName('alt-bg');
	},
	
	altBackground: function()
	{
		this.controller.getSceneScroller().addClassName('alt-bg');
	},
	
	errorDialog: function(msg , cb)
	{
		var cb = cb || Mojo.doNothing;
		if (this.lastErrorMesssage && this.lastErrorMesssage.timestamp > Morsel.getTimeStamp() - 2 && this.lastErrorMesssage.message == msg)
		{
			return;
		}
		else
		{
			this.lastErrorMesssage = {message: msg , timestamp: Morsel.getTimeStamp()};
			this.msgDialog("Error" , msg , cb);
		}
	},
	
	msgDialog: function(titleText , msg , cb)
	{
		var titleText = titleText || "Title";
		var msg = msg || "message alert text";
		var cb = cb || function() {};
		this.controller.showAlertDialog({
			    onChoose: cb ,
			    title: titleText,
			    message: msg,
			    choices:[
			         {label:$L('continue')} 
			    ]
			   });
	},
	
	showBanner: function(text)
	{
		this.controller.showBanner({messageText: text , icon: "twee"} , {} , "twee");
	},
	
	showLoading: function(text)
	{
		var loading;
		if (!this.loadingScrim)
		{
			this.loadingScrim = new Element('div' , {className: 'scrim'});
			loading = new Element('div' , {className: 'loading'});
			loading.innerHTML = text || "Loading...";
			this.loadingScrim.appendChild(loading);
			this.controller.getSceneScroller().appendChild(this.loadingScrim);
		}
		else
		{
			loading = this.loadingScrim.down('.loading');
			loading.innerHTML = text || "Loading...";
		}
		loading.setStyle({marginLeft: "-" + Math.floor(loading.getWidth()/2) + "px"});
		return this.loadingScrim;
	},
	
	hideLoading: function()
	{
		if (this.loadingScrim && this.loadingScrim.remove)
		{
			this.loadingScrim.remove();
			delete this.loadingScrim;
		}
	},
	
	handleCommand: function(event)
	{
		return this.doHandleCommand(event);
	},
	
	doHandleCommand: function(event)
	{
		if (event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.helpCmd || event.command == Mojo.Menu.prefsCmd)) 
		{
         	event.stopPropagation(); // enable help. now we have to handle it
		}
		
		if (event.type == Mojo.Event.command) 
		{
			switch (event.command) 
			{
				case Mojo.Menu.helpCmd:
					this.controller.stageController.pushScene('Support');
				break;
				
				case Mojo.Menu.prefsCmd:
					this.controller.stageController.pushScene('Preferences');
				break;
				
				case 'api-status':
					this.openBrowser("http://apistatus.twitter.com/");
				break;
			}
		}
		
		if (event.type == Mojo.Event.forward)
		{
			if (this.newTweet)
			{
				this.newTweet();
			}
		}
	},
	
	orientationChanged: function(orientation)
	{
		if (this.currentOrientation === orientation || !Twee.Preferences.getRotation())
		{
			return;
		}
		
		this.currentOrientation = orientation;
		this.controller.window.PalmSystem.setWindowOrientation(this.currentOrientation);
	},
	
	openGoogleMaps: function(address)
	{
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
		    method: 'launch',
		    parameters: {
		        id:"com.palm.app.maps",
		        params: {query: address}
		    }
		});
	},
	
	openBrowser: function(url)
	{
		this.controller.serviceRequest('palm://com.palm.applicationManager' , {method: 'open' ,
          parameters: {
                        id: 'com.palm.app.browser',
                        params: { target: url }
                      }});
	},
	
	setupScroll: function()
	{
		var hdr = this.get('main-hdr');
		if (hdr)
		{
			this.autoScrollClick = this.autoScrollClick.bind(this);
			hdr.observe(Mojo.Event.tap , this.autoScrollClick);
		}
	},
	
	cleanupScroll: function()
	{
		var hdr = this.get('main-hdr');
		if (hdr)
		{
			hdr.stopObserving(Mojo.Event.tap , this.autoScrollClick);
		}
	},
	
	autoScrollClick: function()
	{
		if (this.scroller && this.scroller.mojo)
		{
			this.scroller.mojo.scrollTo(0 , 0 , true , false);
		}
	},
	
	switchTo: function(name)
	{
		if (this.controller.sceneName != "Main")
		{
			this.controller.stageController.popScenesTo("Main" , {switchTo: name});
		}
		else
		{
			this.activateAndSwitchToSubview(name);
		}
	}
});