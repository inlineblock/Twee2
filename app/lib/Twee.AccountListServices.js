Twee.AccountListServices = {

	/* LISTS */
	
	getListsWhereUser: function(o)
	{
		o = o || {};
		o.url = "https://api.twitter.com/1/{username}/lists/memberships.json";
		this.getLists(o);
	},
	
	getListsForUser: function(o)
	{
		o = o || {};
		o.url = "https://api.twitter.com/1/{username}/lists.json";
		this.getLists(o);
	},
	
	getListSubscriptions: function(o)
	{
		o = o || {};
		o.url = "https://api.twitter.com/1/{username}/lists/subscriptions.json";
		this.getLists(o);
	},
	
	getLists: function(o)
	{
		o = o || {};
		var callBack = o.callBack || Mojo.doNothing,
			url = o.url,
			url = url.replace("{username}" , o.username),
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: this.token , tokenSecret: this.tokenSecret},
			parameters = {},
			request = {
				method: "GET" ,
				action: url ,
				parameters: []
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: parameters,
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.getListsSuccess.bind(this , callBack),
			onFailure: this.getListsFailure.bind(this , callBack)
		});
	},
	
	getListsSuccess: function(callBack , t)
	{
		if (t.status != 200)
		{
			return this.getListsFailure(callBack , t);
		}
		
		try
		{
			var data = t.responseText.evalJSON();
			return callBack(true , data.lists);
		}
		catch(e)
		{
			return this.getListsFailure(callBack , t);
		}
	},
	getListsFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	}
};
Twee.Account.addMethods(Twee.AccountListServices);