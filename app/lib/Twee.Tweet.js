Twee.Tweet = Class.create({
	storables: [
		'id',
		'favorited',
		'source',
		'place',
		'placeFullName',
		'coordinates',
		'created_at',
		'replyToUser',
		'replyToUserName',
		'replyToID',
		'text',
		'originalText',
		'truncated',
		'isDirectMessage'
	],
	initialize: function(user)
	{
		this.currentUser = user;
	},
	
	loadFromAjax: function(raw)
	{
		this.id = raw.id + "";
		this.favorited = raw.favorited;
		this.source = (raw.source && raw.source.stripTags ? raw.source.unescapeHTML().stripTags() : false);
		this.place = raw.place;
		if (this.place)
		{
			this.placeFullName = this.place.full_name;
		}
		this.coordinates = raw.coordinates;
		this.created_at = raw.created_at;
		this.createDates();
		this.replyToUser = raw.in_reply_to_user_id || "";
		this.replyToUserName = raw.in_reply_to_screen_name || "";
		this.replyToID = raw.in_reply_to_status_id || false;
		
		this.text = raw.text;
		this.originalText = raw.text;
		this.truncated = raw.truncated || false;
		this.isDirectMessage = (raw.recipient && raw.sender && !raw.source ? true : false);
		
		
		//create a tweetuser (aka a user not on this account)
		if (raw.user)
		{
			this.user = new Twee.TweetUser().loadFromAjax(raw.user);
		}
		else if (raw.sender)
		{
			this.user = new Twee.TweetUser().loadFromAjax(raw.sender);
		}
		else // this is from searches
		{
			this.user = new Twee.TweetUser().loadBasicInfo(raw);
		}
		
		if (raw.retweeted_status && raw.retweeted_status.id)
		{
			this.retweet = new Twee.Tweet(this.currentUser).loadFromAjax(raw.retweeted_status);
			this.text = "<retweet>RT @" + this.retweet.user.username + "</retweet>: " + this.retweet.text;
		}
		
		this.createCSSClass();
		this.processText();
		return this;
	},
	
	createDates: function()
	{
		this.created = new Date(this.created_at);
		this.fullDate = this.created.format(Morsel.dateTimeFormat);
		this.prettyDate = this.prettyDateText(this.created);
	},
	
	loadFromSearchAjax: function(raw)
	{
		return this.loadFromAjax(raw);
	},
	
	loadFromUsersAjax: function(raw)
	{
		try
		{
			this.loadFromAjax(raw.status);
			if (this.text)
			{
				this.text = $L('[Private Account]');
			}
			this.user = new Twee.TweetUser();
			this.user.loadFromAjax(raw);
			this.createCSSClass();
			return this;
		}
		catch(e)
		{
			return;
		}
	},
	
	redoPrettyText: function()
	{
		this.prettyDate = this.prettyDateText(this.created);
	},
	
	
	
	prettyDateText: function(orig_date)
	{
		var date = new Date(orig_date);
		var now = new Date();
		var diff = (now.getTime() - date.getTime()) / 1000;
		var day_diff = Math.floor(diff / 86400);
		if (isNaN(day_diff))
		{
			return this.created.format(Morsel.fullDateFormat);
		}
		
		switch(true)
		{
			case diff < 60:
				return "just now";
			break;
			
			case diff < 120: 
				return "<strong>1</strong> minute ago";
			break;
			
			case diff < 3600:
				return "<strong>" + Math.floor(diff / 60) + "</strong> minutes ago";
			break;
			
			case diff < 7200:
				return "<strong>1</strong> hour ago";
			break;
			
			case diff < 172799:
				return "about <strong>" + Math.floor(diff / 3600) + "</strong> hours ago";
			break;
		}
		
		switch(true)
		{
			
			case day_diff < 7:
				return "<strong>" + day_diff + "</strong> days ago";
			break;
			
			case day_diff < 22:
				return "<strong>" + Math.ceil( day_diff / 7 ) + "</strong> weeks ago";
			break;
			
			default:
				return this.created.format(Morsel.fullDateFormat);
			break;
		}
		
	},
	
	processText: function()
	{
		if (!this.retweet)
		{
			this.text = this.text.replace(/^(RT @[\w]+)/ , "<retweet>$1</retweet>").replace(/(\(via @[\w]+\))$/i , "<retweet>$1</retweet>");
		}
		
		this.text = this.text.replace(/(@[A-z0-9_]+)/g , "<mention>$1</mention>").replace(/(#[A-z0-9_]+)/g , "<hash>$1</hash>").replace(/(\$[A-z0-9_]+)/g , "<hash>$1</hash>").replace(/(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig , function(t) { return "<url>" + t + "</url>"; });
	},
	
	createCSSClass: function()
	{
		var tweet_text = this.text.toLowerCase();
		this.cssClass = "";
		if (this.currentUser && this.currentUser.username)
		{
			var username = "@" + this.currentUser.username.toLowerCase();
			
			if (tweet_text.indexOf(username)  != -1)
			{
				this.cssClass += " reply";
			}
			if (this.user && this.user.username == this.currentUser.username)
			{
				this.cssClass += " current";
			}
		}
		if (this.replyToID && this.replyToUserName)
		{
			this.cssClass += " in-reply-to";
		}
		if (this.isDirectMessage)
		{
			this.cssClass += " direct-message";
		}
		if (this.place)
		{
			this.cssClass += " has-place";
		}
		if (this.favorited)
		{
			this.cssClass += " favorited";
		}
	},
	
	
	getThumbnails: function()
	{
		var prefixs = [
						{match: "http://twitpic.com/" , thumbnail: "http://twitpic.com/show/thumb/{id}", large: "http://twitpic.com/show/full/{id}"} ,
						{match: "http://yfrog.com/" , thumbnail: "http://yfrog.com/{id}.th.jpg", large: "http://yfrog.com/{id}:iphone"} ,
						{match: "http://tweetphoto.com/" , thumbnail: "http://TweetPhotoAPI.com/api/TPAPI.svc/json/imagefromurl?size=thumbnail&url=http://tweetphoto.com/{id}", large: "http://TweetPhotoAPI.com/api/TPAPI.svc/imagefromurl?size=big&url=http://tweetphoto.com/{id}"} ,
						{match: "http://pic.gd/" , thumbnail: "http://TweetPhotoAPI.com/api/TPAPI.svc/json/imagefromurl?size=thumbnail&url=http://pic.gd/{id}", large: "http://TweetPhotoAPI.com/api/TPAPI.svc/imagefromurl?size=big&url=http://pic.gd/{id}"} ,
						{match: "http://img.ly/" , thumbnail: "http://img.ly/show/thumb/{id}", large: "http://img.ly/show/large/{id}"} ,
						{match: "http://twitgoo.com/" , thumbnail: "http://twitgoo.com/{id}/thumb", large: "http://twitgoo.com/{id}/img"} ,
						{match: "http://flic.kr/p/"  , thumbnail: "http://flic.kr/p/img/{id}_s.jpg", large: "http://flic.kr/p/img/{id}_m.jpg"}
						],
			postfix = "([\\w]+)",
			options = ["gi" , "i"],
			founded = [],
			thumbnails = [];
			
		prefixs.each(function(o) {
			var reg = new RegExp(o.match + postfix , options[0]),
				matches = this.text.match(reg);
			if (matches && matches.length > 0)
			{
				founded.push({o: o , matches: matches});
			}
		} , this);
		
		founded.each(function(found) {
			found.matches.each(function(ma) {
				var reg = new RegExp(found.o.match + postfix , options[1]),
					parts = ma.match(reg);
				if (parts[1])
				{
					thumbnails.push({
						url: ma,
						thumbnail: found.o.thumbnail.replace('{id}' , parts[1]),
						large: found.o.large.replace('{id}' , parts[1])
					});
				}
			} , this);
		} , this);
		
		return thumbnails;
	},
	
	
	getPlaceCenter: function()
	{
		
		if (!this.place)
		{
			return "950 W. Maude Ave Sunnyvale, CA 94085";
		}
		else
		{
			
			if (this.place.bounding_box && this.place.bounding_box.coordinates && Object.isArray(this.place.bounding_box.coordinates) && Object.isArray(this.place.bounding_box.coordinates[0]))
			{
				var coords = {lat: 0 , 'long': 0};
				this.place.bounding_box.coordinates[0].each(function(co) {
					coords.lat += co[0];
					coords['long'] += co[1];
				});
				
				coords.lat = coords.lat / this.place.bounding_box.coordinates[0].length;
				coords['long'] = coords['long'] / this.place.bounding_box.coordinates[0].length;
				return coords['long'] + "," + coords.lat;
			}
			else
			{
				return this.place.full_name;
			}
		}
	},
	
	getStorable: function()
	{
		var store = {};
		this.storables.each(function(s) {
			store[s] = this[s];
		} , this);
		store.user = this.user.getStorable();
		return store;
	},
	
	handleImport: function(data)
	{
		for(var i in data) if (data.hasOwnProperty(i))
		{
			if (i == "user")
			{
				this.user = Twee.TweetUser.fromStorable(data[i]);
			}
			else
			{
				this[i] = data[i];
			}
		}
		this.createDates();
		this.createCSSClass();
		return this;
	}
});