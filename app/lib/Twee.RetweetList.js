Twee.RetweetList = Class.create(Twee.List , {
	
	refreshListParameters: function()
	{
		return {callBack: this.refreshListCallBack , since_id: (this.tweets[0] && this.tweets[0].id ? this.tweets[0].id : false)};
	},
	
	loadMoreListParameters: function()
	{
		return {callBack: this.loadMoreListCallBack , max_id: (this.tweets.length && this.tweets[this.tweets.length-1].id ? this.tweets[this.tweets.length-1].id : false)};
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
	}

});