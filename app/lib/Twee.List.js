Twee.List = Class.create({
	
	listItemClass: 'list-item',
	renderTemplate: 'Main/tweet',
	emptyTemplate: 'Main/empty',
	loadingTweetsClassName: 'loading',
	
	initialize: function(o)
	{
		this.controller = o.controller;
		this.account = o.account;
		this.scroller = o.scroller;
		this.useStorage = o.useStorage || false;
		
		this.refreshIconClick = this.refreshIconClick.bind(this);
		this.refreshListCallBack = this.refreshListCallBack.bind(this);
		this.loadMoreClick = this.loadMoreClick.bind(this);
		this.loadMoreListCallBack = this.loadMoreListCallBack.bind(this);
		this.listClick = this.listClick.bind(this);
		this.storeTweets = this.storeTweets.bind(this);
		this.getTweetsCallBack = this.getTweetsCallBack.bind(this);
		
		this.options = {};
		this.tweets = [];
	},
	
	setup: function(id)
	{
		this.element = this.controller.get(id);
		this.list = this.element.down('.tweet-list');
		this.list.observe(Mojo.Event.tap , this.listClick);
		this.refreshIcon = this.element.down('.refresh-icon');
		if (this.refreshIcon)
		{
			this.refreshIcon.observe(Mojo.Event.tap , this.refreshIconClick);
		}
		
		this.loadMore = this.element.down('.load-more');
		if (this.loadMore)
		{
			this.loadMore.observe(Mojo.Event.tap , this.loadMoreClick);
		}
		
		this.element.widget = this;
		if (this.useStorage && id != "messages-view") // hack no cache
		{
			this.getTweets();
		}
		else
		{
			this.refreshList();
		}
		return this;
	},
	
	cleanup: function()
	{
		this.list.stopObserving(Mojo.Event.tap , this.listClick);
		if (this.refreshIcon)
		{
			this.refreshIcon.stopObserving(Mojo.Event.tap , this.refreshIconClick);
		}
		if (this.loadMore)
		{
			this.loadMore.stopObserving(Mojo.Event.tap , this.loadMoreClick);
		}
	},
	
	aboutToActivate: function()
	{
		
	},
	
	activate: function()
	{
		this.readjustScrollTop();
		// so as long as it isn't already loading up, lets refresh this list, the offset time is to allow other rendering processes to begin
		if (!this.element.hasClassName(this.loadingTweetsClassName))
		{
			window.setTimeout(this.refreshList.bind(this) , 50);
		}
	},
	
	aboutToDeactivate: function()
	{
		this.setOptions();
	},
	
	deactivate: function()
	{
		
	},
	
	refreshList: function(force)
	{
		force = force || false;
		if (!this.element.hasClassName(this.loadingTweetsClassName) || force)
		{
			this.element.addClassName(this.loadingTweetsClassName);
			this.account.getForList(this.element.id , this.refreshListParameters());
		}
	},
	
	refreshListParameters: function()
	{
		return {callBack: this.refreshListCallBack , since_id: (this.tweets[0] && this.tweets[0].id ? this.tweets[0].id : false)};
	},
	
	refreshListCallBack: function(worked , data)
	{
		if (worked && Object.isArray(data))
		{
			var size = this.tweets.length;
			this.mergeTweets(data.reverse());
			window.setTimeout(this.renderTweets.bind(this , (size != this.tweets.length)) , 25);
		}
		else
		{
			this.element.removeClassName(this.loadingTweetsClassName);
			if (this.element.hasClassName('show'))
			{
				this.controller.errorDialog(data || 'Error occurred while processing your request.');
			}
		}
	},
	
	loadMoreClick: function()
	{
		this.loadMoreList();
	},
	
	loadMoreList: function()
	{
		if (!this.element.hasClassName(this.loadingTweetsClassName))
		{
			this.element.addClassName(this.loadingTweetsClassName);
			this.account.getForList(this.element.id , this.loadMoreListParameters());
		}
	},
	
	loadMoreListParameters: function()
	{
		return {callBack: this.loadMoreListCallBack , max_id: (this.tweets.length && this.tweets[this.tweets.length-1].id ? this.tweets[this.tweets.length-1].id : false)};
	},
	
	loadMoreListCallBack: function(worked , data)
	{
		this.element.removeClassName(this.loadingTweetsClassName);
		if (worked && Object.isArray(data))
		{
			this.mergeTweets(data);
			window.setTimeout(this.renderTweets.bind(this , false) , 25);
		}
		else
		{
			if (this.element.hasClassName('show'))
			{
				this.controller.errorDialog(data || 'Error occurred while processing your request.');
			}
		}
	},
	
	listClick: function(evt)
	{
		var el = evt.target, tweet = false;
		if (!el.hasClassName('tweet'))
		{
			tweet = el.up('.tweet');
		}
		else
		{
			tweet = el;
		}
		
		if (!tweet)
		{
			return false;
		}
		var id = tweet.id.substr(6);
		this.controller.push('ViewTweet' , {tweets: this.tweets , index: this.getTweetIndex(id) , account: this.account});
	},
	
	mergeTweets: function(tweets)
	{
		tweets.each(function(tweet) {
			if (!tweet)
			{
				return;
			}
			
			if (this.tweets.length === 0)
			{
				return this.tweets.push(tweet);
			}
			
			var nid = tweet.id,
				fid = this.tweets[0].id,
				lid = this.tweets[this.tweets.length-1].id;
			if (nid.isGreaterThan(fid))
			{
				this.tweets.unshift(tweet);
			}
			else if (lid.isGreaterThan(nid))
			{
				this.tweets.push(tweet);
			}
			
		} , this);
	},
	
	renderTweets: function(change , noStore)
	{
		var html = [];
		
		if (this.tweets.length > 0)
		{
			this.tweets.each(function(tweet) {
				tweet.redoPrettyText();
				html.push(Mojo.View.render({object: tweet , template: this.renderTemplate}));
			} , this);
		}
		else
		{
			html.push(Mojo.View.render({object: {} , template: this.emptyTemplate}));
		}
		
		if (this.element.hasClassName('show'))
		{
			this.setOptions();
		}
		
		this.list.innerHTML = html.join('');
		
		if (this.tweets.length > 499)
		{
			this.loadMore.hide();
		}
		else
		{
			this.loadMore.show();
		}
		
		if (change)
		{
			this.readjustScrollTop();
		}
		
		this.element.removeClassName(this.loadingTweetsClassName);
		if (this.useStorage && !noStore && change)
		{
			if (this.controller.listHasNewContent)
			{
				this.controller.listHasNewContent(this.element.id);
			}
		}
		
		if (this.useStorage && !noStore)
		{
			window.setTimeout(this.storeTweets , 0);
		}
		window.setTimeout(function() {
			Twee.Notifications.enable();
		} , 5000);
	},
	
	readjustScrollTop: function()
	{
		var scrollTop;
		if (this.element.hasClassName('show'))
		{
			if (this.options && this.options.offsetHeight > 40) // so the default size is 38px i believe, so this makes sure that there were tweets and it was adjuested etc
			{
				scrollTop = this.options.scrollTop + (this.element.offsetHeight - this.options.offsetHeight);
			}
			else
			{
				scrollTop = 0;
			}
			if (scrollTop < 0)
			{
				scrollTop = 0;
			}
			this.scroller.scrollTop = scrollTop;
			this.setOptions();
		}
	},
	
	setOptions: function()
	{
		this.options = {scrollTop: this.scroller.scrollTop , offsetHeight: this.element.offsetHeight , tweetCount: this.tweets.length};
	},
	
	refreshIconClick: function()
	{
		this.refreshList();
	},
	
	getTweetIndex: function(id)
	{
		for(var i =0,e = this.tweets.length; i < e; i++)
		{
			if (this.tweets[i].id == id)
			{
				return i;
			}
		}
	},
	
	removeTweet: function(tweet)
	{
		if (this.tweets.length > 0 && this.tweets.indexOf(tweet) != -1)
		{
			this.tweets = this.tweets.without(tweet);
			this.renderTweets(true);
		}
	},
	
	clearTweets: function()
	{
		this.tweets = [];
		this.list.innerHTML = "";
	},
	
	storeTweets: function()
	{
		this.account.storeTweets(this.element.id , this.tweets);
	},
	
	getTweets: function()
	{
		this.element.addClassName(this.loadingTweetsClassName);
		this.account.getTweets(this.element.id , this.getTweetsCallBack);
	},
	
	getTweetsCallBack: function(tweets)
	{
		tweets = tweets || [];
		this.mergeTweets(tweets.reverse());
		window.setTimeout(this.renderTweets.bind(this , false , true) , 0);
		window.setTimeout(this.refreshList.bind(this , true) , 5);
	},
	
	windowWasActivated: function()
	{
		this.refreshList();
	}

});