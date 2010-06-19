Twee.UserList = Class.create(Twee.List , {
	renderTemplate: "Main/user",
	
	refreshListParameters: function()
	{
		Mojo.Log.info('Twee.UserList refreshListParameters');
		return {callBack: this.refreshListCallBack , screen_name: this.controller.username , cursor: "-1"};
	},
	
	loadMoreListParameters: function()
	{
		return {callBack: this.loadMoreListCallBack , screen_name: this.controller.username , cursor: this.cursor};
	},
	
	readjustScrollTop: function()
	{
		if (this.element.hasClassName('show'))
		{
			if (this.options && this.options.offsetHeight > 150) // so the default size is 38px i believe, so this makes sure that there were tweets and it was adjuested etc
			{
				this.scroller.scrollTop = this.options.scrollTop + (this.element.offsetHeight - this.options.offsetHeight);
			}
			else
			{
				this.scroller.scrollTop = 0;
			}
			this.setOptions();
		}
	},
	
	refreshListCallBack: function(worked , data , cursor)
	{
		this.cursor = cursor;
		if (worked && Object.isArray(data))
		{
			var size = this.tweets.length;
			this.tweets = data;
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
	
	loadMoreListCallBack: function(worked , data , cursor)
	{
		this.cursor = cursor;
		this.element.removeClassName(this.loadingTweetsClassName);
		if (worked && Object.isArray(data))
		{
			data.each(function(t) {
				this.tweets.push(t);
			} , this);
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
	
	renderTweets: function(change)
	{
		var html = [];
		this.tweets.each(function(tweet) {
			html.push(Mojo.View.render({object: tweet , template: this.renderTemplate}));
		} , this);
		
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
	},
	
	listClick: function(evt)
	{
		var el = evt.target, userEl = false;
		if (!el.hasClassName('user'))
		{
			userEl = el.up('.user');
		}
		else
		{
			userEl = el;
		}
		
		if (!userEl)
		{
			return false;
		}
		var id = userEl.id.substr(5),
			index = this.getTweetIndex(id),
			user = this.tweets[index];
		this.controller.push("ViewUser" , {account: this.account , username: user.username , user: user});
	}

});