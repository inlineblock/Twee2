NewDirectMessageAssistant = Class.create(NewTweetAssistant , {

	setup: function($super)
	{
		$super(true);
		this.altBackground();
		var mainHdr = this.get('main-hdr');
		this.user = this.options.user;
		if (this.user.username)
		{
			mainHdr.innerHTML = "DM @" + this.user.username;
		}
		
		this.textModel = {value: this.getTextValue()};
		this.controller.setupWidget('tweetText' , { hintText: '', multiline: true, enterSubmits: false, focus: true , changeOnKeyPress: true} , this.textModel);
		
		this.charactersLeft = this.get('characters-left');
		this.tweetText = this.get('tweetText');
		this.attachedMedia = this.get('attached-media');
		this.controlGrid = new Twee.ControlGrid(this.get('control-grid'));
		
		this.tweetText.observe(Mojo.Event.propertyChange, this.textChange);
		this.controlGrid.observe("action" , this.controlGridAction);
		
		this.controller.setupWidget('tweetButton' , {label: $L("Send Message")} , {buttonClass: "tweeButton"});
		this.get('tweetButton').observe(Mojo.Event.tap , this.tweetClick);
		
		this.showLoading("Checking Permissions...");
		this.checkFriendship();
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
	},
	
	sendTweet: function()
	{
		
		if (this.selectedMedia)
		{
			this.showLoading("Uploading...");
			this.account.sendDirectMessageWithMedia({
				status: this.textModel.value,
				media: this.selectedMedia.fullPath,
				mediaType: this.selectedMedia.attachmentType,
				callBack: this.sendTweetCallBack,
				updateCallBack: this.sendTweetUpdateCallBack,
				username: this.user.username
			});
		}
		else
		{
			this.showLoading("Sending...");
			this.account.sendDirectMessage({
				status: this.textModel.value,
				callBack: this.sendTweetCallBack,
				username: this.user.username
			});
		}
	},
	
	sendTweetCallBack: function(worked , data)
	{
		this.hideLoading();
		if (worked)
		{
			this.pop();
		}
		else
		{
			this.errorDialog(data || "Unable to send direct message at this time.");
		}
	},
	
	sendTweetUpdateCallBack: function(update)
	{
		this.showLoading("Sending...");
	},
	
	attachLocation: function(){},
	
	checkFriendship: function()
	{
		this.account.getFriendshipStatus({callBack: this.checkFriendshipCallBack.bind(this) , user_b: this.account.username , user_a: this.user.username});
	},
	
	checkFriendshipCallBack: function(worked , status)
	{
		this.hideLoading();
		if (!worked)
		{
			return this.errorDialog(status || "Unable to determine your friendship status. Aborting..." , this.pop.bind(this));
		}
		
		if (!status)
		{
			return this.errorDialog("You do not have permissions to direct message this user. They must be following you in order to direct message them." , this.pop.bind(this));
		}
	}

});