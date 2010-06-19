Twee.AccountServices = {
	killActiveRequest: function()
	{
		if (this.activeRequest && !this.activeRequest._complete)
		{
			this.activeRequest.transport.abort();
		}
	},
	
	getForList: function(list , o)
	{
		switch(list)
		{
			case 'timeline-view':
				this.getTimeline(o);
			break;
			
			case 'mentions-view':
				this.getMentions(o);
			break;
			
			case 'messages-view':
				this.getDirectMessages(o);
			break;
			
			case 'search-view':
				this.getSearch(o);
			break;
			
			case 'user-search-view':
				this.getUsersSearch(o);
			break;
			
			case 'conversation-view':
				this.getConversation(o);
			break;
			
			case 'favorites-view':
				this.getFavorites(o);
			break;
			
			case 'users-tweets-view':
				this.getUsersTweets(o);
			break;
			
			case 'followers-view':
				this.getFollowers(o);
			break;
			
			case 'following-view':
				this.getFollowing(o);
			break;
			
			case 'retweets-by-view':
				this.getRetweetsByMe(o);
			break;
			
			case 'retweets-of-view':
				this.getRetweetsOfMe(o);
			break;
			
			case 'list-statuses-view':
				this.getListStatuses(o);
			break;
		}
	},
	
	
	retweet: function(o)
	{
		var url = "https://api.twitter.com/1/statuses/retweet/{id}.json".replace("{id}" , o.tweet.id),
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = {id: o.tweet.id},
			request = {
				method: "POST" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
		
		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.retweetSuccess.bind(this , callBack),
			onFailure: this.retweetFailure.bind(this , callBack)
		});
		
	},
	
	retweetSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			this.retweetFailure(callBack , t);
		}
		try
		{
			var tweet = t.responseText.evalJSON();
			if (tweet.created_at)
			{
				callBack(true);
			}
			else
			{
				this.retweetFailure(callBack , t);
			}
		}
		catch(e)
		{
			this.retweetFailure(callBack , t);
		}
	},
	
	retweetFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	sendDirectMessageWithMedia: function(o)
	{
		o.postMediaCallBack = this.sendDirectMessage.bind(this);
		this.sendTweetWithMedia(o);
	},
	
	sendDirectMessage: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/direct_messages/new.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubDirectMessageParameters(o),
			request = {
				method: "POST" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.sendDirectMessageSuccess.bind(this , callBack),
			onFailure: this.sendDirectMessageFailure.bind(this , callBack)
		});
	},
	
	sendDirectMessageSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			this.sendDirectMessageFailure(callBack , t);
		}
		try
		{
			var tweet = t.responseText.evalJSON();
			if (tweet.created_at)
			{
				callBack(true);
			}
			else
			{
				this.sendDirectMessageFailure(callBack , t);
			}
		}
		catch(e)
		{
			this.sendDirectMessageFailure(callBack , t);
		}
	},
	
	sendDirectMessageFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	sendTweet: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/statuses/update.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubTweetParameters(o),
			request = {
				method: "POST" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.sendTweetSuccess.bind(this , callBack),
			onFailure: this.sendTweetFailure.bind(this , callBack)
		});
	},
	
	sendTweetSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			this.sendTweetFailure(callBack , t);
		}
		try
		{
			var tweet = t.responseText.evalJSON();
			if (tweet.created_at)
			{
				callBack(true);
			}
			else
			{
				this.sendTweetFailure(callBack , t);
			}
		}
		catch(e)
		{
			this.sendTweetFailure(callBack , t);
		}
	},
	
	sendTweetFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	sendTweetWithMedia: function(o)
	{
		o = o || {};
		var uploadSettings = this.getMediaUploadSettings(o.mediaType),
			url = uploadSettings.echoURL || "https://api.twitter.com/1/account/verify_credentials.xml" ,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			request = {
				method: "GET" ,
				action: url ,
				parameters: []
			},
			postParams = [{key: 'message' , data: o.status}],
			customHeaders = [];
   		OAuth.completeRequest(request , accessor);
   		
   		if (uploadSettings.key)
   		{
   			postParams.push({key: 'key' , data: uploadSettings.key});
   		}
   		
   		if (uploadSettings.header)
   		{
   			customHeaders.push(uploadSettings.header + ": " + OAuth.getAuthorizationHeader(request.action , request.parameters));
   			customHeaders.push("X-Auth-Service-Provider: " + request.action);
   		}
   		else
   		{
   			if (uploadSettings.post)
   			{
   				postParams.push({key: uploadSettings.post , data: OAuth.getAuthorizationHeader(request.action , request.parameters), contentType: 'string'});
   				postParams.push({key: "x_auth_service_provider" , data: request.action , contentType: 'string'});
   			}
   		}
		
		this.activeRequest = new Mojo.Service.Request('palm://com.palm.downloadmanager/', {
			method: 'upload', 
			parameters: {
				fileName: o.media,
				fileLabel: 'media',
				contentType: o.mediaType,
				url: uploadSettings.url,
				postParameters: postParams,
				subscribe: true,
				customHttpHeaders: customHeaders
			},
			onSuccess: this.sendTweetWithMediaSuccess.bind(this , o),
			onFailure: this.sendTweetWithMediaFailure.bind(this , o)
		 });
	},
	
	sendTweetWithMediaSuccess: function(o , t)
	{
		o = o || {};
		t = t || {};
		if (t.completed)
		{
			try
			{
				var media_url = this.extractMediaURL(t.responseString);
				if (media_url)
				{
					var trim = 140 - (o.status.length + media_url.length + 1),
						updateCallBack = o.updateCallBack || Mojo.doNothing;
					if (trim < 0)
					{
						o.status = o.status.substr(0 , o.status.length + trim) + " " + media_url;
					}
					else
					{
						o.status = o.status + " " + media_url;
					}
					window.setTimeout(updateCallBack , 0);
					if (o.postMediaCallBack)
					{
						o.postMediaCallBack(o);
					}
					else
					{
						this.sendTweet(o);
					}
				}
				else
				{
					this.sendTweetWithMediaFailure(o);
				}
			}
			catch(e)
			{
				this.sendTweetWithMediaFailure(o);
			}
		}
	},
	
	sendTweetWithMediaFailure: function(o , t)
	{
		var callBack = o.callBack || Mojo.doNothing
		callBack(false , "Attached media upload failed.");
	},
	
	getMediaUploadSettings: function(type)
	{
		if (type == 'image')
		{
			switch(Twee.Preferences.getPhotoProvider())
			{
				case 'yfrog':
					return {url: 'https://yfrog.com/api/xauth_upload' , header: "X-Verify-Credentials-Authorization"};
				break;
				
				case 'imgly':
					return {url: 'http://img.ly/api/2/upload.xml' , header: "X-Verify-Credentials-Authorization" , echoURL: "https://api.twitter.com/1/account/verify_credentials.json"};
				break;
				
				case 'twitpic':
				default:
					return {url: "http://api.twitpic.com/2/upload.xml" , header: "Authorization" , key: Twee.twitpicKey , echoURL: "https://api.twitter.com/1/account/verify_credentials.json"};
				break;
			}
		}
		else
		{
			return {url: 'http://im.twitvid.com/api/upload' , header: false , post: 'x_verify_credentials_authorization'};
		}
		
	},
	
	extractMediaURL: function(str)
	{
		try
		{
			var parser = new DOMParser(),
				doc = parser.parseFromString(str, "text/xml");
				media_urls = doc.getElementsByTagName('media_url'),
				mediaurls = doc.getElementsByTagName('mediaurl'),
				urls = doc.getElementsByTagName('url'),
				text = false;
			
			if (media_urls.length > 0)
			{
				text = media_urls[0].textContent;
			}
			else if (urls.length > 0)
			{
				text = urls[0].textContent;
			}
			else if (mediaurls.length > 0)
			{
				text = mediaurls[0].textContent;
			}
			
			return text;
		}
		catch(e)
		{
			return false;
		}
	},
	
	
	deleteTweet: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/statuses/destroy.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = {id: o.tweet.id},
			request = {
				method: "POST" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.deleteTweetSuccess.bind(this , callBack),
			onFailure: this.deleteTweetFailure.bind(this , callBack)
		});
	},
	
	deleteTweetSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			this.deleteTweetFailure(callBack , t);
		}
		else
		{
			callBack(true);
		}
	},
	
	deleteTweetFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	getFavorites: function(o)
	{
		return this.getBasicTweets("https://api.twitter.com/1/favorites.json" , o , 'scrubFavoritesParameters');
	},
	
	favoriteTweet: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/favorites/create/{id}.json".replace("{id}" , o.tweet.id),
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = {id: o.tweet.id},
			request = {
				method: "POST" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.favoriteTweetSuccess.bind(this , callBack),
			onFailure: this.favoriteTweetFailure.bind(this , callBack)
		});
	},
	
	favoriteTweetSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			this.favoriteTweetFailure(callBack , t);
		}
		else
		{
			callBack(true);
		}
	},
	
	favoriteTweetFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	unfavoriteTweet: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/favorites/destroy/{id}.json".replace("{id}" , o.tweet.id),
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = {id: o.tweet.id},
			request = {
				method: "POST" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.unfavoriteTweetSuccess.bind(this , callBack),
			onFailure: this.unfavoriteTweetFailure.bind(this , callBack)
		});
	},
	
	unfavoriteTweetSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			this.unfavoriteTweetFailure(callBack , t);
		}
		else
		{
			callBack(true);
		}
	},
	
	unfavoriteTweetFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	getListStatuses: function(o)
	{	
		o = o || {};
		var url = "https://api.twitter.com/1/{username}/lists/{id}/statuses.json".replace("{username}" , o.username).replace("{id}" , o.id),
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubBasicListParameters(o),
			request = {
				method: "GET" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
			
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.getBasicTweetsSuccess.bind(this , callBack),
			onFailure: this.getBasicTweetsFailure.bind(this , callBack)
		});
	},
		
	getBasicTweets: function(url , o , scrubber)
	{
		o = o || {};
		scrubber = scrubber || 'scrubBasicParameters';
		var callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this[scrubber](o),
			request = {
				method: "GET" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
			
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.getBasicTweetsSuccess.bind(this , callBack),
			onFailure: this.getBasicTweetsFailure.bind(this , callBack)
		});
	},
	
	getBasicTweetsSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.getBasicTweetsFailure(callBack , t);
		}
		
		try
		{
			var tweets = [],
				raw = t.responseText.evalJSON();
			for(var i=0; i < raw.length; i++)
			{
				tweets.push(new Twee.Tweet(this).loadFromAjax(raw[i]));
			}
			return callBack(true , tweets);
		}
		catch(e)
		{
			return this.getBasicTweetsFailure(callBack , t);
		}
	},
	
	getBasicTweetsFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false , this.getErrorForTransport(t));
	},
	
	getTimeline: function(o)
	{
		return this.getBasicTweets("https://api.twitter.com/1/statuses/home_timeline.json" , o);
	},
	
	getMentions: function(o)
	{
		return this.getBasicTweets("https://api.twitter.com/1/statuses/mentions.json" , o);
	},
	
	getDirectMessages: function(o)
	{
		return this.getBasicTweets("https://api.twitter.com/1/direct_messages.json" , o);
	},
	
	getUsersTweets: function(o)
	{
		return this.getBasicTweets("https://api.twitter.com/1/statuses/user_timeline.json" , o);
	},
	
	getRetweetsOfMe: function(o)
	{
		return this.getBasicTweets("https://api.twitter.com/1/statuses/retweets_of_me.json" , o);
	},
	
	getRetweetsByMe: function(o)
	{
		return this.getBasicTweets("https://api.twitter.com/1/statuses/retweeted_by_me.json" , o);
	},
	
	
	
	getFollowers: function(o)
	{
		this.getUsersList("https://api.twitter.com/1/statuses/followers.json" , o);
	},
	
	getFollowing: function(o)
	{
		this.getUsersList("https://api.twitter.com/1/statuses/friends.json" , o);
	},
	
	getUsersList: function(url , o)
	{
		o = o || {};
		var callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubUsersListParameters(o),
			request = {
				method: "GET" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
			
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.getUsersListSuccess.bind(this , callBack),
			onFailure: this.getUsersListFailure.bind(this , callBack)
		});
	},
	
	getUsersListSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			return this.getUsersListFailure(callBack , t);
		}
		
		try
		{
			var data = t.responseText.evalJSON(),
				users = [];
				
			for(var i=0; i < data.users.length; i++)
			{
				users.push(new Twee.TweetUser(this).loadFromAjax(data.users[i]));
			}
			callBack(true , users , data.next_cursor_str);
		}
		catch(e)
		{
			return this.getUsersListFailure(callBack , t);
		}
	},
	
	getUsersListFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false , this.getErrorForTransport(t));
	},
	
	getFriendshipStatus: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/friendships/exists.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = {user_a: o.user_a , user_b: o.user_b},
			request = {
				method: "GET" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
			
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.getFriendshipStatusSuccess.bind(this , callBack),
			onFailure: this.getFriendshipStatusFailure.bind(this , callBack)
		});
	},
	
	getFriendshipStatusSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			return this.getFriendshipStatusFailure(callBack , t);
		}
		
		try
		{
			Mojo.Log.info("getFriendshipStatusSuccess" , t.responseText);
			var data = t.responseText.evalJSON();
			callBack(true , data);
		}
		catch(e)
		{
			return this.getFriendshipStatusFailure(callBack , t);
		}
	},
	
	getFriendshipStatusFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false , this.getErrorForTransport(t));
	},
	
	getUsersSearch: function(o)
	{
		var callBack = o.callBack || Mojo.doNothing,
			url = "https://api.twitter.com/1/users/search.json",
			parameters = this.scrubUserSearchParameters(o),
			anonymous = o.anonymous || false;
		if (anonymous)
		{
			this.activeRequest = new Ajax.Request(url , {
				method: "GET",
				parameters: parameters,
				onSuccess: this.getSearchSuccess.bind(this , callBack),
				onFailure: this.getSearchFailure.bind(this , callBack)
			});
		}
		else
		{
			var accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
				request = {
					method: "GET",
					action: url,
					parameters: Object.clone(parameters)
				};
			
	   		OAuth.completeRequest(request , accessor);
			this.activeRequest = new Ajax.Request(url , {
				method: request.method,
				parameters: parameters,
				requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
				onSuccess: this.getUsersSearchSuccess.bind(this , callBack),
				onFailure: this.getUsersSearchFailure.bind(this , callBack)
			});
		}
		
	},
	
	getUsersSearchSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.getSearchFailure(callBack , t);
		}
		
		try
		{
			var tweets = [],
				raw = t.responseText.evalJSON();
			for(var i=0; i < raw.length; i++)
			{
				tweets.push(new Twee.TweetUser(this).loadFromAjax(raw[i]));
			}
			return callBack(true , tweets);
		}
		catch(e)
		{
			return this.getUsersSearchFailure(callBack , t);
		}
	},
	
	getUsersSearchFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false , this.getErrorForTransport(t));
	},
	
	
	getSearch: function(o)
	{
		var callBack = o.callBack || Mojo.doNothing,
			url = "https://search.twitter.com/search.json",
			parameters = this.scrubSearchParameters(o),
			anonymous = o.anonymous || false;
		
		if (anonymous)
		{
			this.activeRequest = new Ajax.Request(url , {
				method: "GET",
				parameters: parameters,
				onSuccess: this.getSearchSuccess.bind(this , callBack),
				onFailure: this.getSearchFailure.bind(this , callBack)
			});
		}
		else
		{
			var accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
				request = {
					method: "GET",
					action: url,
					parameters: Object.clone(parameters)
				};
			
	   		OAuth.completeRequest(request , accessor);
			this.activeRequest = new Ajax.Request(url , {
				method: request.method,
				parameters: parameters,
				requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
				onSuccess: this.getSearchSuccess.bind(this , callBack),
				onFailure: this.getSearchFailure.bind(this , callBack)
			});
		}
		
	},
	
	getSearchSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.getSearchFailure(callBack , t);
		}
		
		try
		{
			var tweets = [],
				raw = t.responseText.evalJSON().results;
			for(var i=0; i < raw.length; i++)
			{
				tweets.push(new Twee.Tweet(this).loadFromSearchAjax(raw[i]));
			}
			return callBack(true , tweets);
		}
		catch(e)
		{
			return this.getSearchFailure(callBack , t);
		}
	},
	
	getSearchFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false , this.getErrorForTransport(t));
	},
	
	
	getTrends: function(o)
	{
		var callBack = o.callBack || Mojo.doNothing,
			url = "https://api.twitter.com/1/trends.json",
			parameters = {};
		
		this.activeRequest = new Ajax.Request(url , {
			method: "GET",
			parameters: parameters,
			onSuccess: this.getTrendsSuccess.bind(this , callBack),
			onFailure: this.getTrendsFailure.bind(this , callBack)
		});
	},
	
	getTrendsSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		try
		{
			var response = t.responseText.evalJSON();
			if (Object.isArray(response.trends))
			{
				var trends = [];
				response.trends.each(function(trend) {
					trends.push(new Twee.Trend(trend));
				}, this);
				
				return callBack(true , trends , (response.as_of ? new Date(response.as_of) : new Date()));
			}
			else
			{
				this.getTrendsFailure(callBack);
			}
		}
		catch(e)
		{
			this.getTrendsFailure(callBack);
		}
	
	},
	
	getTrendsFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	getURLTrends: function(o)
	{
		var callBack = o.callBack || Mojo.doNothing,
			url = 'http://api.tweetmeme.com/stories/popular.json',
			parameters = {count: o.count || 15};
		
		this.activeRequest = new Ajax.Request(url , {
			method: "GET",
			parameters: parameters,
			onSuccess: this.getURLTrendsSuccess.bind(this , callBack),
			onFailure: this.getURLTrendsFailure.bind(this , callBack)
		});
	},
	
	getURLTrendsSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		try
		{
			var response = t.responseText.evalJSON();
			if (Object.isArray(response.stories))
			{
				var trends = [];
				response.stories.each(function(trend) {
					trends.push(new Twee.URLTrend(trend));
				}, this);
				return callBack(true , trends);
			}
			else
			{
				this.getURLTrendsFailure(callBack);
			}
		}
		catch(e)
		{
			this.getURLTrendsFailure(callBack);
		}
	},
	
	getURLTrendsFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	getUser: function(o)
	{
		var url = "https://api.twitter.com/1/users/show.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubUserParameters(o),
			request = {
				method: "GET",
				action: url,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.getUserSuccess.bind(this , callBack),
			onFailure: this.getUserFailure.bind(this , callBack)
		});
	},
	
	getUserSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			return this.getUserFailure(callBack , t);
		}
		
		try
		{
			var u = t.responseText.evalJSON();
				user = new Twee.TweetUser(this).loadFromAjax(u);
			return callBack(true , user);
		}
		catch(e)
		{
			this.getUserFailure(callBack , t);
		}
	},
	
	getUserFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false , this.getErrorForTransport(t));
	},
	
	
	
	
	
	
	
	
	reportUser: function(o)
	{
		var url = "https://api.twitter.com/1/report_spam.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubUserParameters(o),
			request = {
				method: "POST",
				action: url,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.reportUserSuccess.bind(this , callBack),
			onFailure: this.reportUserFailure.bind(this , callBack)
		});
	},
	
	reportUserSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.reportUserFailure(callBack , t);
		}
		try
		{
			var data = t.responseText.evalJSON(),
				user = new Twee.TweetUser(this).loadFromAjax(data);
			callBack(true , true);
		}
		catch(e)
		{
			return this.reportUserFailure(callBack , t);
		}
	},
	
	reportUserFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	
	blockUser: function(o)
	{
		var url = "https://api.twitter.com/1/blocks/create.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubUserParameters(o),
			request = {
				method: "POST",
				action: url,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.blockUserSuccess.bind(this , callBack),
			onFailure: this.blockUserFailure.bind(this , callBack)
		});
	},
	
	blockUserSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.blockUserFailure(callBack , t);
		}
		try
		{
			var data = t.responseText.evalJSON(),
				user = new Twee.TweetUser(this).loadFromAjax(data);
			callBack(true , true);
		}
		catch(e)
		{
			return this.blockUserFailure(callBack , t);
		}
	},
	
	blockUserFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	
	unblockUser: function(o)
	{
		var url = "https://api.twitter.com/1/blocks/destroy.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubUserParameters(o),
			request = {
				method: "POST",
				action: url,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.unblockUserSuccess.bind(this , callBack),
			onFailure: this.unblockUserFailure.bind(this , callBack)
		});
	},
	
	unblockUserSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.unblockUserFailure(callBack , t);
		}
		try
		{
			var data = t.responseText.evalJSON(),
				user = new Twee.TweetUser(this).loadFromAjax(data);
			callBack(true , true);
		}
		catch(e)
		{
			return this.unblockUserFailure(callBack , t);
		}
	},
	
	unblockUserFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	
	
	
	
	
	followUser: function(o)
	{
		var url = "https://api.twitter.com/1/friendships/create.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubUsersListParameters(o),
			request = {
				method: "POST",
				action: url,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.followUserSuccess.bind(this , callBack),
			onFailure: this.followUserFailure.bind(this , callBack)
		});
	},
	
	followUserSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.followUserFailure(callBack , t);
		}
		try
		{
			var data = t.responseText.evalJSON(),
				user = new Twee.TweetUser(this).loadFromAjax(data);
			callBack(true , true);
		}
		catch(e)
		{
			return this.followUserFailure(callBack , t);
		}
	},
	
	followUserFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	unfollowUser: function(o)
	{
		var url = "https://api.twitter.com/1/friendships/destroy.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = this.scrubUsersListParameters(o),
			request = {
				method: "POST",
				action: url,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.unfollowUserSuccess.bind(this , callBack),
			onFailure: this.unfollowUserFailure.bind(this , callBack)
		});
	},
	
	unfollowUserSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.unfollowUserFailure(callBack , t);
		}
		try
		{
			var data = t.responseText.evalJSON(),
				user = new Twee.TweetUser(this).loadFromAjax(data);
			callBack(true , false);
		}
		catch(e)
		{
			return this.unfollowUserFailure(callBack , t);
		}
	},
	
	unfollowUserFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , this.getErrorForTransport(t));
	},
	
	getSavedSearches: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/saved_searches.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			request = {
				method: "GET" ,
				action: url ,
				parameters: []
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: {},
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.getSavedSearchesSuccess.bind(this , callBack),
			onFailure: this.getSavedSearchesFailure.bind(this , callBack)
		});
	},
	
	getSavedSearchesSuccess: function(callBack, t)
	{
		if (t.status != 200)
		{
			return this.getSavedSearchesFailure(callBack, t);
		}
		
		try
		{
			var searches = t.responseText.evalJSON();
			if (Object.isArray(searches))
			{
				callBack(true , searches);
			}
			else
			{
				return this.getSavedSearchesFailure(callBack, t);
			}
		}
		catch(e)
		{
			return this.getSavedSearchesFailure(callBack, t);
		}
	},
	
	getSavedSearchesFailure: function(callBack, t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	saveSearch: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/saved_searches/create.json",
			callBack = o.callBack || Mojo.doNothing,
			parameters = {query: o.query},
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			request = {
				method: "POST" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.saveSearchSuccess.bind(this , callBack),
			onFailure: this.saveSearchFailure.bind(this , callBack)
		});
	},
	
	saveSearchSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			return this.saveSearchFailure(callBack , t);
		}
		
		try
		{
			var resp = t.responseText.evalJSON();
			callBack(true , resp.id);
		}
		catch(e)
		{
			return this.saveSearchFailure(callBack , t);
		}
	},
	saveSearchFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	unsaveSearch: function(o)
	{
		o = o || {};
		var url = "https://api.twitter.com/1/saved_searches/destroy/{id}.json".replace("{id}" , o.id),
			callBack = o.callBack || Mojo.doNothing,
			parameters = {id: o.id},
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			request = {
				method: "POST" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.unsaveSearchSuccess.bind(this , callBack),
			onFailure: this.unsaveSearchFailure.bind(this , callBack)
		});
	},
	
	unsaveSearchSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			return this.unsaveSearchFailure(callBack , t);
		}
		
		try
		{
			var resp = t.responseText.evalJSON();
			callBack(true);
		}
		catch(e)
		{
			return this.unsaveSearchFailure(callBack , t);
		}
	},
	unsaveSearchFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	getConversation: function(o)
	{
		var url = "https://api.twitter.com/1/statuses/show.json",
			callBack = o.callBack || Mojo.doNothing,
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = {id: o.tweets[o.tweets.length-1].replyToID},
			request = {
				method: "GET" ,
				action: url ,
				parameters: Object.clone(parameters)
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.getConversationSuccess.bind(this , o),
			onFailure: this.getConversationFailure.bind(this , o)
		});
	},
	
	getConversationSuccess: function(o , t)
	{
		var callBack = o.callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			return this.getConversationFailure(o , t);
		}
		
		try
		{
			var raw = t.responseText.evalJSON(),
				tweet = new Twee.Tweet(this).loadFromAjax(raw);
			o.tweets.push(tweet);
			if (tweet.replyToID)
			{
				window.setTimeout(this.getConversation.bind(this , o) , 0);
			}
			else
			{
				callBack(true , o.tweets);
			}
		}
		catch(e)
		{
			return this.getConversationFailure(o , t);
		}
	},
	
	getConversationFailure: function(o)
	{
		var callBack = o.callBack || Mojo.doNothing;
		callBack(true , o.tweets);
	},
	
	getWhatTheTrend: function(o)
	{
		o = o || {};
		var callBack = o.callBack || Mojo.doNothing,
			url = "http://api.whatthetrend.com/api/trend/getByName/" + encodeURIComponent(o.trend) + "/json";
		this.activeRequest = new Ajax.Request(url , {onSuccess: this.getWhatTheTrendSuccess.bind(this , callBack) , onFailure: this.getWhatTheTrendFailure.bind(this , callBack)});
	},
	
	getWhatTheTrendSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			return this.getWhatTheTrendFailure(callBack , t);
		}
		
		try
		{
			var data = t.responseText.evalJSON();
			if (data && data.api && data.api.trend && data.api.trend.blurb)
			{
				window.setTimeout(function() { callBack(true , data.api.trend); } , 0);
			}
			else
			{
				return this.getWhatTheTrendFailure(callBack , t);
			}
		}
		catch(e)
		{
			return this.getWhatTheTrendFailure(callBack , t);
		}
	},
	
	getWhatTheTrendFailure: function(callBack,  t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	shortenLink: function(o)
	{
		o = o || {};
		var url = "http://api.bit.ly/v3/shorten",
			parameters = {
				format: "json",
				longUrl: o.url,
				login: Mojo.Controller.appInfo.BitlyApiLogin,
				apiKey: Mojo.Controller.appInfo.BitlyApiKey
			};
		this.activeRequest = new Ajax.Request(url , {method: "GET" , parameters: parameters , onSuccess: this.shortenLinkSuccess.bind(this , o) , onFailure: this.shortenLinkFailure.bind(this , o)});
			
	},
	
	shortenLinkSuccess: function(o , t)
	{
		o = o || {};
		callBack = o.callBack || Mojo.doNothing;
		if (t.status != 200)
		{
			return this.shortenLinkFailure(o , t);
		}
		try
		{
			Mojo.Log.info('shortenLinkSuccess' , t.responseText);
			var d = t.responseText.evalJSON();
			if (d.status_code == 200)
			{
				callBack(true , d.data);
			}
			else
			{
				return this.shortenLinkFailure(o , t);
			}
		}
		catch(e)
		{
			return this.shortenLinkFailure(o , t);
		}
	},
	
	shortenLinkFailure: function(o , t)
	{
		o = o || {};
		callBack = o.callBack || Mojo.doNothing;
		callBack(false);
	},
	
	getErrorForTransport: function(t)
	{
		Mojo.Log.info('getErrorForTransport' , t.status , t.responseText);
		switch(t.status)
		{
			case 502:
			case 503:
				return $L("Twitter's servers are overloaded. Please check their status and try again later.");
			break;
			
			case 400:
					var now = Math.floor(new Date().getTime()/1000),
						diff = Math.ceil((t.getHeader('X-RateLimit-Reset') - now)/60);
				return $L("You have reached your twitter rate limit for this hour. Please try again in {min} minutes.").replace("{min}" , diff);
			break;
			
			case 401:
				return $L("Twee does not have permissions to view this content.");
			break;
			
			case 200:
				return $L("Twitter returned back malformed data, please try again in a few minutes.");
			break;
			
			case 0:
				return $L("Twitter's servers were unreachable. They may be overloaded or you may not have an internet connection.");
			break;
		}
		return false;
	}

};

Twee.Account.addMethods(Twee.AccountServices);