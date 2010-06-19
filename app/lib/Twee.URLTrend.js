Twee.URLTrend = Class.create({
	initialize: function(o)
	{
		this.text = o.excerpt;
		this.title = o.title;
		this.url = o.url;
		this.urlCount = o.url_count;
		this.tweetMeURL = o.tm_link;
		this.thumbnail = o.thumbnail || "images/icon_48x48.png";
		this.createdAt = new Date(o.created_at);
	}
});