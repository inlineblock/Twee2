Twee.ConversationList = Class.create(Twee.List , {
	
	refreshListParameters: function()
	{
		return {callBack: this.refreshListCallBack , tweets: [this.controller.options.tweet]};
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
	
	renderTweets: function(change)
	{
		var html = [];
		this.tweets.reverse();
		this.tweets.each(function(tweet) {
			tweet.redoPrettyText();
			html.push(Mojo.View.render({object: tweet , template: this.renderTemplate}));
		} , this);
		
		if (this.element.hasClassName('show'))
		{
			this.setOptions();
		}
		
		this.list.innerHTML = html.join('');
		
		if (change)
		{
			this.readjustScrollTop();
		}
		
		this.element.removeClassName(this.loadingTweetsClassName);
	},

});