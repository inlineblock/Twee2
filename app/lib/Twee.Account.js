Twee.Account = Class.create({
	
	depotable: [
		'token' ,
		'tokenSecret',
		'username',
		'name',
		'description',
		'profileImage',
		'internalIdentifier',
		'id'
	],

	initialize: function(o)
	{
		o = o || {};
		this.depotable.each(function(d) {
			if (o[d])
			{
				this[d] = o[d];
			}
		} , this);
	},
	
	authorizeLoad: function(oauth , user)
	{
		this.token = oauth.oauth_token;
		this.tokenSecret = oauth.oauth_token_secret;
		this.username = user.screen_name;
		this.id = user.id;
		this.name = user.name;
		this.description = user.description;
		this.profileImage = user.profile_image_url;
		return this;
	},
	
	getDepotable: function()
	{
		var storage = {};
		this.depotable.each(function(d) {
			storage[d] = this[d];
		} , this);
		return storage;
	},
	
	save: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		Twee.AccountManager.saveAccount(this , callBack);
	},
	
	destroy: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		Twee.AccountManager.deleteAccount(this , callBack);
	},
	
	storeTweets: function(id , tweets)
	{
		var proper = ['timeline-view' , 'mentions-view' , 'messages-view'],
			store = [],
			i = 0;
		if (proper.indexOf(id) == -1)
		{
			return false;
		}
		for(i; i < tweets.length && i < 50; i++)
		{
			store.push(tweets[i].getStorable());
		}
		
		Twee.AccountManager.userStorageSet(this.storeTweetsCallBack.bind(this) , this , id , store);
	},
	
	storeTweetsCallBack: function(worked)
	{
	},
	
	getTweets: function(id , callBack)
	{
		var proper = ['timeline-view' , 'mentions-view' , 'messages-view'];
		if (proper.indexOf(id) == -1)
		{
			return false;
		}
		Twee.AccountManager.userStorageGet(this.getTweetsCallBack.bind(this , callBack) , this , id);
	},
	
	getTweetsCallBack: function(callBack , data)
	{
		callBack = callBack || Mojo.doNothing;
		data = data || [],
		tweets = [];
		try
		{
			data.each(function(d) {
				tweets.push(new Twee.Tweet(this).import(d));
			} , this);
		}
		catch(e)
		{
			tweets = [];
		}
		
		callBack(tweets);
	}
	
});
Object.extend(Twee.Account.prototype , Twee.AccountServices);