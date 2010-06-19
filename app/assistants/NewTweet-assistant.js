NewTweetAssistant = Class.create(Twee.Base , {
	Binds: ['textChange' , 'controlGridAction' , 'tweetClick' , 'addMediaCallBack' , 'removeLocationCallBack' , 'attachLocationSuccess' , 'attachLocationFailure' , 'sendTweetCallBack' , 'sendTweetUpdateCallBack'],
	
	setup: function($super , skip)
	{
		skip = skip || false;
		
		$super();
		if (skip)
		{
			return;
		}
		this.altBackground();
		var mainHdr = this.get('main-hdr');
		if (this.options.reply)
		{
			mainHdr.innerHTML = "Reply to @" + this.options.reply.user.username;
		}
		else if (this.options.retweet)
		{
			mainHdr.innerHTML = "Retweet";
		}
		else
		{
			mainHdr.innerHTML = "New Tweet";
		}
		
		this.textModel = {value: this.getTextValue()};
		this.controller.setupWidget('tweetText' , { hintText: '', multiline: true, enterSubmits: false, focus: true , changeOnKeyPress: true} , this.textModel);
		
		this.charactersLeft = this.get('characters-left');
		this.tweetText = this.get('tweetText');
		this.attachedMedia = this.get('attached-media');
		this.attachedLocation = this.get('attached-location');
		this.controlGrid = new Twee.ControlGrid(this.get('control-grid'));
		
		this.tweetText.observe(Mojo.Event.propertyChange, this.textChange);
		this.controlGrid.observe("action" , this.controlGridAction);
		
		this.controller.setupWidget('tweetButton' , {label: $L("Tweet")} , {buttonClass: "tweeButton"});
		this.get('tweetButton').observe(Mojo.Event.tap , this.tweetClick);
		
		if (!this.options.reply && !this.options.retweet && Twee.Preferences.getLocation().auto)
		{
			this.attachLocation();
		}
	},
	
	cleanup: function($super)
	{
		this.tweetText.stopObserving(Mojo.Event.propertyChange, this.textChange);
		this.controlGrid.stopObserving("action" , this.controlGridAction);
		this.controlGrid.cleanup();
		$super();
	},
	
	activate: function()
	{
		this.textChange();
	},
	
	getTextValue: function()
	{
		if (this.options.reply)
		{
			return "@" + this.options.reply.user.username + " ";
		}
		else if (this.options.retweet)
		{
			var tw = this.options.retweet.retweet || this.options.retweet;
			return "RT @{username}: {text}".replace('{username}' , tw.user.username).replace('{text}' , tw.originalText);
		}
		else
		{
			return (this.options.text ? this.options.text + " " : "");
		}
	},
	
	textChange: function()
	{
		this.updateCharactersLeft();
	},
	
	updateCharactersLeft: function()
	{
		var chrs = this.getCharactersLeft();
		this.charactersLeft.innerHTML = chrs;
		if (chrs < 10)
		{
			this.charactersLeft.addClassName('red');
		}
		else
		{
			this.charactersLeft.removeClassName('red');
		}
		
		if (this.selectedMedia)
		{
			this.attachedMedia.addClassName('show');
		}
		else
		{
			this.attachedMedia.removeClassName('show');
		}
		
		if (this.attachingLocation)
		{
			this.attachedLocation.addClassName('loading');
			this.attachedLocation.removeClassName('show');
		}
		else if (this.location)
		{
			this.attachedLocation.removeClassName('loading');
			this.attachedLocation.addClassName('show');
		}
		else
		{
			this.attachedLocation.removeClassName('loading');
			this.attachedLocation.removeClassName('show');
		}
	},
	
	getCharactersLeft: function()
	{
		var start = 140;
		if (this.selectedMedia)
		{
			start = start - 27;
		}
		return start - this.textModel.value.length;
	},
	
	controlGridAction: function(evt)
	{
		switch(evt.action)
		{
			case 'media':
				if (this.selectedMedia)
				{
					return this.controller.showAlertDialog({
						    onChoose: this.removeMediaCallBack ,
						    title: "Remove Media?",
						    message: "Do you want to remove the currently attached media?",
						    choices:[
								{label:$L('Remove Attached Media') , value: 2},
								{label:$L('Attach Different Media') , value: 1},
								{label:$L('cancel') , value: 0 , type: 'dismiss'}
						    ]
						   });
				}
				else
				{
					return Mojo.FilePicker.pickFile({kinds: ['image' , 'video'] , onSelect: this.addMediaCallBack} , this.controller.stageController);
				}
			break;
			
			case 'location':
				if (this.location)
				{
					return this.controller.showAlertDialog({
						    onChoose: this.removeLocationCallBack ,
						    title: "Remove Location?",
						    message: "Do you want to remove the currently attached location information?",
						    choices:[
								{label:$L('Remove Location') , value: 1},
								{label:$L('cancel') , value: 0 , type: 'dismiss'}
						    ]
						   });
				}
				else
				{
					return this.attachLocation();
				}
			
			break;
			
			case 'shrink url':
				var links = this.textModel.value.match(/[A-z]+:\/\/[A-Za-z0-9-_]+\.[A-z0-9-_:%&\?\/.=]+/g);
				if (!links || !links.length)
				{
					this.errorDialog("No URLs found to shrink. Please add them to the text then click this button again.");
				}
				else
				{
					this.shortenLinks(links);
				}
			break;
		}
	},
	
	tweetClick: function(evt)
	{
		if (this.getCharactersLeft() < 0)
		{
			return this.errorDialog("Your tweet must be under 140 characters. Media attachments take up to 27 characters.");
		}
		else if (this.getCharactersLeft() == 140)
		{
			return this.errorDialog("You must type in a tweet.");
		}
		
		this.sendTweet();
	},
	
	sendTweet: function()
	{
		
		if (this.selectedMedia)
		{
			this.showLoading("Uploading...");
			this.account.sendTweetWithMedia({
				status: this.textModel.value,
				location: (this.location ? this.location : false),
				reply: (this.options.reply ? this.options.reply : false),
				media: this.selectedMedia.fullPath,
				mediaType: this.selectedMedia.attachmentType,
				callBack: this.sendTweetCallBack,
				updateCallBack: this.sendTweetUpdateCallBack
			});
		}
		else
		{
			this.showLoading("Posting...");
			this.account.sendTweet({
				status: this.textModel.value,
				location: (this.location ? this.location : false),
				reply: (this.options.reply ? this.options.reply : false),
				callBack: this.sendTweetCallBack
			});
		}
	},
	
	sendTweetCallBack: function(worked , data)
	{
		this.hideLoading();
		if (worked)
		{
			this.pop({refreshTimeline: true});
		}
		else
		{
			this.errorDialog(data || "Unable to post tweet at this time.");
		}
	},
	
	sendTweetUpdateCallBack: function(update)
	{
		this.showLoading("Posting...");
	},
	
	addMediaCallBack: function(file)
	{
		if (!file) return false;
		this.selectedMedia = file;
		this.updateCharactersLeft();
	},
	
	removeMediaCallBack: function(r)
	{
		if (r === 0)
		{
			return false;
		}
		else if (r === 1)
		{
			this.selectedMedia = false;
			Mojo.FilePicker.pickFile({kinds: ['image' , 'video'] , onSelect: this.addMediaCallBack} , this.controller.stageController);
		}
		else if (r === 2)
		{
			this.selectedMedia = false;
		}
		this.updateCharactersLeft();
	},
	
	
	removeLocationCallBack: function(r)
	{
		if (r === 0)
		{
			return false;
		}
		else
		{
			this.location = false;
		}
		this.updateCharactersLeft();
	},
	
	attachLocation: function()
	{
		if (!this.attachingLocation)
		{
			this.attachingLocation = true;
			this.controller.serviceRequest('palm://com.palm.location', {
				method : 'getCurrentPosition',
		        parameters: {
					accuracy: 3 ,
		            responseTime: 2 ,
		            maximumAge: 30
		        },
		        onSuccess: this.attachLocationSuccess,
		        onFailure: this.attachLocationFailure
		    });
		    this.updateCharactersLeft();
	    }
	},
	
	attachLocationSuccess: function(evt)
	{
		this.attachingLocation = false;
		this.location = {latitude:evt.latitude , longitude: evt.longitude , lastUpdate: new Date().getTime()};
		this.updateCharactersLeft();
	},
	
	attachLocationFailure: function()
	{
		this.attachingLocation = false;
		this.errorDialog("Unable to locate you.");
		this.updateCharactersLeft();
	},
	
	shortenLinks: function(links)
	{
		Mojo.Log.info(Object.toJSON(links));
		this.showLoading("Shrinking...");
		if (links.length == 0)
		{
			this.hideLoading();
			this.controller.modelChanged(this.textModel);
			this.updateCharactersLeft();
			return;
		}
		
		this.account.shortenLink({callBack: this.shortenLinksCallBack.bind(this , links , links[0]) , url: links[0]});
	},
	
	shortenLinksCallBack: function(links , link , worked , data)
	{
		if (!worked || !data.url)
		{
			this.hideLoading();
			this.errorDialog("Unable to shrink some links. Try again later.");
			this.controller.modelChanged(this.textModel);
			this.updateCharactersLeft();
			return;
		}
		this.textModel.value = this.textModel.value.replace(link , data.url);
		this.shortenLinks(links.without(link));
	}
});