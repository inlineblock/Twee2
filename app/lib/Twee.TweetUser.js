Twee.TweetUser = Class.create({
	storables: [
		'username',
		'name',
		'user_id',
		'id',
		'profileImage',
		'fullProfileImage',
		'following',
		'location',
		'verified',
		'url',
		'blocked',
		'tweetCount',
		'followersCount',
		'friendsCount',
		'favoritesCount',
		'description'
	],
	initialize: function()
	{
	},
	
	loadFromAjax: function(raw)
	{
		this.username = raw.screen_name;
		this.name = raw.name;
		this.user_id = raw.id;
		this.id = raw.id;
		this.profileImage = raw.profile_image_url;
		
		if (this.profileImage.substr(this.profileImage.length - 28, 16) == "default_profile_")
		{
			this.fullProfileImage = "http://s.twimg.com/a/1274899949/images/3_bigger.png";
		}
		else
		{
			this.fullProfileImage = raw.profile_image_url.replace('_normal.' , '.');
		}
		
		this.following = raw.following || false;
		this.location = raw.location || "";
		this.verified = raw.verified;
		this.url = raw.url || "";
		this.blocked = raw.blocked;
		
		this.tweetCount = raw.statuses_count || 0;
		this.followersCount = raw.followers_count || 0;
		this.friendsCount = raw.friends_count || 0;
		this.favoritesCount = raw.favourites_count || 0;
		
		this.description = raw.description || false;
		this.buildClassName();
		return this;
	},
	
	loadBasicInfo: function(raw)
	{
		this.username = raw.from_user;
		this.profileImage = raw.profile_image_url;
		if (this.profileImage.substr(this.profileImage.length - 28, 16) == "default_profile_")
		{
			this.fullProfileImage = "http://s.twimg.com/a/1274899949/images/3_bigger.png";
		}
		else
		{
			this.fullProfileImage = raw.profile_image_url.replace('_normal.' , '.');
		}
		this.buildClassName();
		return this;
	},
	
	buildClassName: function()
	{
		this.className = "";
		if (this.location)
		{
			this.className += " has-location";
		}
		if (this.url)
		{
			this.className += " has-url";
		}
		if (this.description)
		{
			this.className += " has-description";
		}
		if (this.following)
		{
			this.className += " following";
		}
		if (this.verified)
		{
			this.className += " verified";
		}
	},
	
	handleImport: function(data)
	{
		for(var i in data) if (data.hasOwnProperty(i))
		{
			this[i] = data[i];
		}
		this.buildClassName();
		return this;
	},
	
	getStorable: function()
	{
		var store = {};
		this.storables.each(function(s) {
			store[s] = this[s];
		} , this);
		return store;
	}
});

Twee.TweetUser.fromStorable = function(data)
{
	return new Twee.TweetUser().handleImport(data);
};