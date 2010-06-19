ViewUserAssistant = Class.create(Twee.Base , {
	
	Binds: ['getUserCallBack' , 'userAreaClick' , 'userMoreClick' , 'userFollowingClick' , 'toggleFollowingCallBack' , 'controlGridAction' , 'reportUserPrompt' , 'reportUserCallBack' , 'blockUserPrompt' , 'blockUserCallBack' , 'unblockUserCallBack'],
	userAreaTemplate: "ViewUser/user-area",
	userMoreTemplate: "ViewUser/user-more",
	
	setup: function($super)
	{
		this.account = this.options.account;
		this.altBackground();
		
		$super();
		var mainHdr = this.get('main-hdr');
		mainHdr.innerHTML = "@" + this.options.username;
		
		this.account.getUser({callBack: this.getUserCallBack , username: this.options.username});
		
		this.userArea = this.get('user-area');
		this.userArea.observe(Mojo.Event.tap , this.userAreaClick);
		this.userMore = this.get('user-more');
		this.userMore.observe(Mojo.Event.tap , this.userMoreClick);
		this.userFollowing = this.get('user-following');
		this.userFollowing.observe(Mojo.Event.tap , this.userFollowingClick);
		this.userFollowing.innerHTML = "loading...";
		if (!this.user)
		{
			this.user = {username: this.options.username};
		}
		
		var cG = this.get('control-grid');
		this.controlGrid = new Twee.ControlGrid(cG);
		this.controlGrid.observe("action" , this.controlGridAction);
		
		if (this.options.currentUser)
		{
			this.controlGrid.element.addClassName('hide');
		}
		
		this.render(true);
	},
	
	cleanup: function($super)
	{
		this.userArea.stopObserving(Mojo.Event.tap , this.userAreaClick);
		this.userMore.stopObserving(Mojo.Event.tap , this.userMoreClick);
		this.userFollowing.stopObserving(Mojo.Event.tap , this.userFollowingClick);
		this.controlGrid.stopObserving("action" , this.controlGridAction);
		this.controlGrid.cleanup();
		$super();
	},
	
	activate: function()
	{
		
	},
	
	getUserCallBack: function(worked , data)
	{
		if (!worked)
		{
			this.errorDialog("The user \"{username}\" was not found.".replace("{username}" , this.options.username.stripTags()) , this.pop.bind(this));
		}
		else
		{
			this.user = data;
			this.render();
		}
	},
	
	render: function(loading)
	{
		this.userArea.innerHTML = Mojo.View.render({object: this.user , template: this.userAreaTemplate});
		if (loading)
		{
			this.userMore.innerHTML = "";
			this.userMore.addClassName('loading');
		}
		else
		{
			this.userMore.removeClassName('loading');
			
			this.userMore.innerHTML = Mojo.View.render({object: this.createMoreObject() , template: this.userMoreTemplate});
			
			if (this.user.username == this.account.username)
			{
				this.userFollowing.innerHTML = "This is your account.";
				this.controlGrid.element.addClassName('hide');
			}
			else if (this.user.following)
			{
				this.userFollowing.innerHTML = "You are following this user.";
			}
			else
			{
				this.userFollowing.innerHTML = "You are not following this user.";
			}
		}
		
	},
	
	createMoreObject: function()
	{
		return {
			tweets: this.user.tweetCount,
			friends: this.user.friendsCount,
			followers: this.user.followersCount,
			favorites: this.user.favoritesCount,
			
			tweets_label: (this.user.tweetCount == 1 ? "tweet" : "tweets"),
			friends_label: (this.user.friendsCount == 1 ? "following" : "following"),
			followers_label: (this.user.followersCount == 1 ? "follower" : "followers"),
			favorites_label: (this.user.favoritesCount == 1 ? "favorite" : "favorites")
		};
	},
	
	userAreaClick: function(evt)
	{
		if (evt.target.hasClassName('user-profile-image'))
		{
			return this.push('DisplayImage' , {imageURL: this.user.fullProfileImage});
		}
		else if (evt.target.hasClassName('url') || evt.target.up('.url'))
		{
			return this.openBrowser(this.user.url);
		}
		else if (evt.target.hasClassName('location') || evt.target.up('.location'))
		{
			return this.openGoogleMaps(this.user.location);
		}
	},
	
	userMoreClick: function(evt)
	{
		
		var action;
		if (!evt.target.hasClassName('action-item'))
		{
			action = evt.target.up('.action-item');
			if (!action)
			{
				return;
			}
		}
		else
		{
			action = evt.target;
		}
		var label = action.down('label');
		switch(label.innerHTML.toLowerCase())
		{
			case "favorite":
			case "favorites":
				this.push("ViewFavorites" , {account: this.account , username: this.user.username});
			break;
			
			case "tweet":
			case "tweets":
				this.push("ViewUsersTweets" , {account: this.account , username: this.user.username});
			break;
			
			case "follower":
			case "followers":
				this.push("ViewFollowers" , {account: this.account , username: this.user.username});
			break;
			
			case "following":
				this.push("ViewFollowing" , {account: this.account , username: this.user.username});
			break;
		}
	},
	
	userFollowingClick: function()
	{
		this.toggleFollowing();
	},
	
	toggleFollowing: function()
	{
		if (this.user.username == this.account.username)
		{
			return false;
		}
		else if (this.user.following)
		{
			this.account.unfollowUser({callBack: this.toggleFollowingCallBack , screen_name: this.user.username});
		}
		else
		{
			this.account.followUser({callBack: this.toggleFollowingCallBack , screen_name: this.user.username});
		}
		this.userFollowing.innerHTML = "loading...";
	},
	
	toggleFollowingCallBack: function(worked , following)
	{
		if (worked)
		{
			this.user.following = following;
			this.render();
		}
		else
		{
			this.userFollowing.innerHTML = "<em>error</em>";
			this.errorDialog(following || "Unable to change your following status at this time.");
		}
	},
	
	controlGridAction: function(evt)
	{
		Mojo.Log.info("controlGridAction" , evt.action);
		switch(evt.action)
		{
			case "follow":
				this.toggleFollowing();
			break;
			
			case 'reply':
				this.push('NewTweet' , {account: this.account , text: "@{username}".replace("{username}" , this.user.username)});
			break;
			
			case 'message':
				this.push('NewDirectMessage' , {account: this.account , user: this.user});
			break;
			
			case 'block':
				if (this.user.blocked)
				{
					this.controller.showAlertDialog({
				    onChoose: this.blockUserPrompt ,
				    title: "Unblock User",
				    message: "Are you sure you want to UNBLOCK this user?",
				    choices:[
						{label:$L('Unblock User') , value: 2 , type: 'primary'},
						{label:$L('cancel') , value: 0 , type: 'dismiss'}
				    ]});
				}
				else
				{
					this.controller.showAlertDialog({
				    onChoose: this.blockUserPrompt ,
				    title: "Block User",
				    message: "Are you sure you want to BLOCK this user?",
				    choices:[
						{label:$L('Block User') , value: 1 , type: 'negative'},
						{label:$L('cancel') , value: 0 , type: 'dismiss'}
				    ]});
				}
			break;
			
			case 'search':
				this.push("ViewSearch" , {account: this.account , search: "@" + this.user.username});
			break;
			
			case 'report':
				this.controller.showAlertDialog({
				    onChoose: this.reportUserPrompt ,
				    title: "Report User",
				    message: "Are you sure you want to report this user for spam?",
				    choices:[
						{label:$L('Report User') , value: 1 , type: 'negative'},
						{label:$L('cancel') , value: 0 , type: 'dismiss'}
				    ]});
			break;
		}
	},
	
	reportUserPrompt: function(r)
	{
		if (r == 1)
		{
			this.showLoading("Reporting...");
			this.account.reportUser({username: this.user.username , callBack: this.reportUserCallBack});
		}
	},
	
	reportUserCallBack: function(worked , message)
	{
		this.hideLoading();
		if (!worked)
		{
			this.errorDialog(message || "Reporting user failed.");
		}
	},
	
	
	blockUserPrompt: function(r)
	{
		if (r == 1)
		{
			this.showLoading("Blocking...");
			this.account.blockUser({username: this.user.username , callBack: this.blockUserCallBack});
		}
		else if (r == 2)
		{
			this.showLoading("Unblocking...");
			this.account.unblockUser({username: this.user.username , callBack: this.unblockUserCallBack});
		}
	},
	
	blockUserCallBack: function(worked)
	{
		this.hideLoading();
		if (!worked)
		{
			this.errorDialog(message || "Blocking user failed.");
		}
		else
		{
			this.user.blocked = true;
		}
	},
	
	unblockUserCallBack: function(worked)
	{
		this.hideLoading();
		if (!worked)
		{
			this.errorDialog(message || "Unblocking user failed.");
		}
		else
		{
			this.user.blocked = false;
		}
	}
	
});