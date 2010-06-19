DisplayImageAssistant = Class.create(Twee.Base , {
	Binds: ['provideURL' , 'downloadResponse'],
	
	setup: function()
	{
		if (!this.options.imageURL)
		{
			return this.pop();
		}
		
		this.orientation = this.controller.stageController.getAppController().getScreenOrientation();
		this.originalOrientation = this.orientation;
		this.flipviewElement = this.controller.get('image_flipview_full');
		this.fullscreen = this.get('fullscreen');
		this.controller.setupWidget('image_flipview_full' , {autoSize:true} , {});
		this.controller.setupWidget(Mojo.Menu.appMenu , {} , {visible: true , items: [{label: "Download Image" , command: 'download-image' }]});
	},
	
	cleanup: function()
	{
		if (Twee.Preferences.getRotation())
		{
			this.controller.window.PalmSystem.setWindowOrientation(this.originalOrientation);
		}
		else
		{
			this.controller.window.PalmSystem.setWindowOrientation("up");
		}
	},
	
	resetSizing: function()
	{
		this.flipviewElement.mojo.manualSize(this.fullscreen.getWidth() , this.fullscreen.getHeight());
	},
	
	handleCommand: function(event)
	{
		if(event.type == Mojo.Event.command) 
		{
			switch(event.command)
			{
				case 'download-image':
					this.downloadImage();
				break;
			}
		}
	},
	
	downloadImage: function()
	{
		var imgurl = this.options.imageURL.replace(' ' , '%20'),
			targetFilename = Morsel.getTimeStamp() + "_img." + imgurl.substr(-3),
			targetFolder = '/media/internal/' + Mojo.Controller.appInfo.title.replace(' ' , '_') + '/';
		try
    	{
    		this.controller.serviceRequest('palm://com.palm.downloadmanager/', 
    		{
    			method: 'download',
    			parameters: {
    					target: imgurl,
    					targetDir: targetFolder,
    					targetFilename: targetFilename,
    					keepFilenameOnRedirect: false,
    					subscribe: false
    				     },
    			onSuccess: Mojo.doNothing,		
    			onFailure: Mojo.doNothing
    		})
    	}	
    	catch(e)
    	{}
    	
    	try
    	{
    		this.controller.serviceRequest('palm://com.palm.downloadmanager/',
    		{
    			method: 'download',
    			parameters: {
    					target: imgurl,
    					targetDir: targetFolder,
    					targetFilename: targetFilename,
    					keepFilenameOnRedirect: false,
    					subscribe: true
    				    },
				onSuccess: this.downloadResponse,
         		onFailure: Mojo.doNothing
    		})
    	}	
    	catch(e)
    	{}
	},
	
	downloadResponse: function(response)
	{
		if (response.completed)
		{
			this.controller.showBanner({messageText: "Image saved successfully." , icon: "Twee"} , {} , "Twee");
		}
	},
	
	activate: function(event)
	{
		var img = new Image();
		img.onload = this.provideURL;
		img.src = this.options.imageURL;
	},
	
	deactivate: function(event)
	{
		
	},
	
	provideURL: function()
	{
		this.loaded = true;
		this.flipviewElement.removeClassName('loading');
		this.flipviewElement.mojo.centerUrlProvided(this.options.imageURL);
		this.resetSizing();
	},
	
	orientationChanged: function(orientation)
	{
		if (this.orientation === orientation) return;
		
		this.orientation = orientation;
		this.controller.window.PalmSystem.setWindowOrientation(this.orientation);
		this.resetSizing();
	}

});