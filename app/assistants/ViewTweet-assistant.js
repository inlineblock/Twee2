ViewTweetAssistant = Class.create(Twee.Base , {
	tweetTemplate: 'ViewTweet/tweet-area',
	locationTemplate: 'ViewTweet/location',
	thumbnailTemplate: 'ViewTweet/thumbnail',
	Binds: ['extraAreaClick' , 'tweetAreaClick' , 'nextTweetClick' , 'previousTweetClick' , 'controlGridAction' , 'retweetPrompt' , 'retweetCallBack' , 'deleteTweetCallBack' , 'deleteTweetPrompt' , 'favoriteTweetCallBack' , 'unfavoriteTweetPrompt' , 'unfavoriteTweetCallBack'],
	
	setup: function($super)
	{
		$super();
		this.account = this.options.account;
		this.extraArea = this.get('extra-area');
		this.tweetArea = this.get('tweet-area');
		this.tweet = this.options.tweets[this.options.index];
		
		this.get('main-hdr').innerHTML = (this.options.index + 1) + ' of ' + this.options.tweets.length;
		this.renderTweetArea();
		
		this.renderExtraArea();
		
		this.tweetArea.observe(Mojo.Event.tap , this.tweetAreaClick);
		this.extraArea.observe(Mojo.Event.tap , this.extraAreaClick);
		
		this.get('next-tweet').observe(Mojo.Event.tap , this.nextTweetClick);
		this.get('previous-tweet').observe(Mojo.Event.tap , this.previousTweetClick);
		
		var cG = this.get('control-grid');
		this.controlGrid = new Twee.ControlGrid(cG);
		this.controlGrid.observe("action" , this.controlGridAction);
		if (this.account.username.toLowerCase() == this.tweet.user.username.toLowerCase())
		{
			cG.addClassName('has-delete');
		}
		
		if (this.tweet.isDirectMessage)
		{
			cG.addClassName('direct-message');
		}
	},
	
	
	
	cleanup: function($super)
	{
		this.tweetArea.stopObserving(Mojo.Event.tap , this.tweetAreaClick);
		this.extraArea.stopObserving(Mojo.Event.tap , this.extraAreaClick);
		this.get('next-tweet').stopObserving(Mojo.Event.tap , this.nextTweetClick);
		this.get('previous-tweet').stopObserving(Mojo.Event.tap , this.previousTweetClick);
		this.controlGrid.stopObserving("action" , this.controlGridAction);
		this.controlGrid.cleanup();
		$super();
	},
	
	renderTweetArea: function()
	{
		this.tweetArea.innerHTML = Mojo.View.render({object: this.tweet , template: this.tweetTemplate});
	},
	
	renderExtraArea: function()
	{
		if (this.tweet.place)
		{
			var center_str = this.tweet.getPlaceCenter();
			this.extraArea.insert(Mojo.View.render({object: {encoded: encodeURIComponent(center_str)} , template: this.locationTemplate}));
		}
		
		var thumbnails = this.tweet.getThumbnails();
		thumbnails.each(function(th) {
			this.extraArea.insert(Mojo.View.render({object: th , template: this.thumbnailTemplate}));
		} , this);
	},
	
	tweetAreaClick: function(evt)
	{
		switch(evt.target.tagName.toLowerCase())
		{
			case "url":
				this.openBrowser(evt.target.innerHTML);
			break;
			
			case "mention":
				this.push("ViewUser" , {account: this.account , username: evt.target.innerHTML.substr(1)});
			break;
			
			case "hash":
				this.push("ViewSearch" , {account: this.account , search: evt.target.innerHTML});
			break;
		}
		
		if (evt.target.hasClassName('user-profile-image'))
		{
			return this.push('DisplayImage' , {imageURL: this.tweet.user.fullProfileImage});
		}
		
		if (evt.target.hasClassName('user-header') || evt.target.up('.user-header'))
		{
			return this.push({name: 'ViewUser' , transition: Mojo.Transition.crossFade} , {account: this.account , username: this.tweet.user.username , user: this.tweet.user});
		}
		
		if (evt.target.hasClassName('in-reply'))
		{
			this.push("ViewConversation" , {account: this.account , tweet: this.tweet});
		}
	},
	
	extraAreaClick: function(evt)
	{
		var el = evt.target;
		if (el.hasClassName('thumbnail-image'))
		{
			el = el.up('.thumbnail-wrapper');
			return this.push('DisplayImage' , {imageURL: el.readAttribute('lang')});
		}
		else if (el.hasClassName('place-image'))
		{
			this.openGoogleMaps(this.tweet.placeFullName);
		}
	},
	
	nextTweetClick: function()
	{
		if (this.options.index + 1 == this.options.tweets.length)
		{
			return;
		}
		this.swap({name: 'ViewTweet' , transition: Mojo.Transition.crossFade} , {tweets: this.options.tweets , index: this.options.index + 1 , account: this.account});
	},
	
	previousTweetClick: function()
	{
		if (this.options.index == 0)
		{
			return;
		}
		this.swap({name: 'ViewTweet' , transition: Mojo.Transition.crossFade} , {tweets: this.options.tweets , index: this.options.index - 1 , account: this.account});
	},
	
	controlGridAction: function(evt)
	{
		switch(evt.action)
		{
			case 'reply':
				if (this.tweet.isDirectMessage)
				{
					this.push('NewDirectMessage' , {account: this.account , user: this.tweet.user});
				}
				else
				{
					this.push('NewTweet' , {account: this.account , reply: this.tweet});
				}
			break;
			
			case 'retweet':
				this.controller.showAlertDialog({
				    onChoose: this.retweetPrompt ,
				    title: "Retweet",
				    message: "Do you want to do use Twitter's retweet feature or a manual retweet with a comment?",
				    choices:[
						{label:$L('Official Retweet') , value: 2},
						{label:$L('With Comment') , value: 1},
						{label:$L('cancel') , value: 0 , type: 'dismiss'}
				    ]
				   });
			break;
			
			case 'favorite':
				if (this.tweet.favorited)
				{
					this.controller.showAlertDialog({
					    onChoose: this.unfavoriteTweetPrompt ,
					    title: "Unfavorite Tweet",
					    message: "Are you sure you want to unfavorite this tweet?",
					    choices:[
							{label:$L('Unfavorite Tweet') , value: 1 , type: 'primary'},
							{label:$L('cancel') , value: 0 , type: 'dismiss'}
					    ]});
				}
				else
				{
					this.showLoading("Favoriting...");
					this.account.favoriteTweet({tweet: this.tweet , callBack: this.favoriteTweetCallBack});
				}
			break;
			
			case 'delete':
				this.controller.showAlertDialog({
				    onChoose: this.deleteTweetPrompt ,
				    title: "Delete Tweet",
				    message: "Are you sure you want to delete this tweet?",
				    choices:[
						{label:$L('Delete Tweet') , value: 1 , type: 'negative'},
						{label:$L('cancel') , value: 0 , type: 'dismiss'}
				    ]});
			break;
		}
	},
	
	deleteTweetPrompt: function(r)
	{
		if (r == 1)
		{
			this.showLoading("Deleting...");
			this.account.deleteTweet({tweet: this.tweet , callBack: this.deleteTweetCallBack});
		}
	},
	
	deleteTweetCallBack: function(worked , message)
	{
		this.hideLoading();
		if (worked)
		{
			this.pop({removeTweet: this.tweet});
		}
		else
		{
			this.errorDialog(message || "Deleting tweet failed.");
		}
	},
	
	retweetPrompt: function(r)
	{
		if (r === 0)
		{
			return false;
		}
		else if (r === 1)
		{
			return this.push('NewTweet' , {account: this.account , retweet: this.tweet});
		}
		else if (r === 2)
		{
			this.showLoading("Retweeting...");
			this.account.retweet({tweet: this.tweet , callBack: this.retweetCallBack});
		}
	},
	
	retweetCallBack: function(worked , message)
	{
		this.hideLoading();
		if (worked)
		{
			this.showBanner("Retweet successful.");
		}
		else
		{
			this.errorDialog(message || "Retweeting failed.");
		}
	},
	
	favoriteTweetCallBack: function(worked , message)
	{
		this.hideLoading();
		if (!worked)
		{
			this.errorDialog(message || "Favoriting this tweet failed.");
		}
		else
		{
			this.tweet.favorited = true;
			this.tweet.createCSSClass();
			this.renderTweetArea();
		}
	},
	
	unfavoriteTweetPrompt: function(r)
	{
		if (r == 1)
		{
			this.showLoading("Unfavoriting...");
			this.account.unfavoriteTweet({tweet: this.tweet , callBack: this.unfavoriteTweetCallBack});
		}
	},
	
	unfavoriteTweetCallBack: function(worked , message)
	{
		this.hideLoading();
		if (!worked)
		{
			this.errorDialog(message || "Unfavoriting this tweet failed.")
		}
		else
		{
			this.tweet.favorited = false;
			this.tweet.createCSSClass();
			this.renderTweetArea();
		}
	}

});