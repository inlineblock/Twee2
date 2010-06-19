Twee.SearchList = Class.create(Twee.List , {
	
	refreshListParameters: function()
	{
		return {callBack: this.refreshListCallBack , q: this.controller.search , since_id: (this.tweets[0] && this.tweets[0].id ? this.tweets[0].id : false) , geocode: this.getLocation()};
	},
	
	loadMoreListParameters: function()
	{
		return {callBack: this.loadMoreListCallBack , q: this.controller.search , page: (this.tweets.length ? Math.ceil(this.tweets.length/50) + 1 : 1) , geocode: this.getLocation()};
	},
	
	getLocation: function()
	{
		if (this.location)
		{
			//"latitude,longitude,radius";
			return this.location.latitude + "," + this.location.longitude + "," + this.location.radius;
		}
		return false;
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