Twee.FavoritesList = Class.create(Twee.List , {

	refreshListParameters: function()
	{
		return {callBack: this.refreshListCallBack , id: this.controller.username};
	},
	
	loadMoreListParameters: function()
	{
		return {callBack: this.loadMoreListCallBack , id: this.controller.username , page: (this.tweets.length ? Math.ceil(this.tweets.length/50) + 1 : 1)};
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