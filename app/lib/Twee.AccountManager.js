Twee.AccountManager = new (Class.create({
	usersDepotKey: 'users-depot-key',
	userStorageKey: '{username}-|-{key}',
	initialize: function()
	{
		this.depot = new Mojo.Depot({name: 'ext:TweeAccountManager' , estimatedSize:100000} , this.initializeDepotSuccess.bind(this), this.initializeDepotFailure.bind(this));
		this.accounts = [];
	},
	
	initializeDepotSuccess: function()
	{
		this.depotReady = true;
		this.depotError = false;
	},
	
	initializeDepotFailure: function()
	{
		this.depotReady = false;
		this.depotError = true;
	},
	
	fixInteralAccounts: function()
	{
		var i =0;
		this.accounts.compact();
		this.accounts.each(function(account) {
			account.internalIdentifier = i+1;
			i++;
		} , this);
	},
	
	save: function(callBack , count)
	{
		callBack = callBack || Mojo.doNothing;
		count = count || 1;
		if (this.depotError || count > 5) return callBack(false);
		if (!this.depotReady) return window.setTimeout(this.save.bind(this , callBack , count+1) , 500);
		
		var storage = [];
		this.accounts.each(function(account) {
			storage.push(account.getDepotable());
		} , this);
		
		this.depot.add(this.usersDepotKey , storage ,  this.saveSuccess.bind(this , callBack) , this.saveFailure.bind(this , callBack));
	},
	
	saveSuccess: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(true);
	},
	
	saveFailure: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	getAccounts: function(callBack , count)
	{
		callBack = callBack || Mojo.doNothing;
		count = count || 1;
		if (this.depotError || count > 5) return callBack(false);
		if (!this.depotReady) return window.setTimeout(this.getAccounts.bind(this , callBack , count+1) , 500);
		
		this.depot.get(this.usersDepotKey ,  this.getAccountsSuccess.bind(this , callBack) , this.getAccountsFailure.bind(this , callBack));
	},
	
	getAccountsSuccess: function(callBack , data)
	{
		callBack = callBack || Mojo.doNothing;
		var accounts = [];
		if (data && data.each)
		{
			data.each(function(a) {
				accounts.push(new Twee.Account(a));
			} , this);
		}
		this.accounts = accounts;
		callBack(this.accounts);
	},
	
	getAccountsFailure: function(callBack , data)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	
	saveAccount: function(account , callBack)
	{
		callBack = callBack || Mojo.doNothing;
		if (!account.internalIdentifier)
		{
			this.accounts.push(account);
		}
		this.fixInteralAccounts();
		this.save(callBack);
	},
	
	deleteAccount: function(account , callBack)
	{
		callBack = callBack || Mojo.doNothing;
		if (!account.internalIdentifier)
		{
			return callBack(false);
		}
		else
		{
			this.accounts = this.accounts.without(account);
		}
		this.fixInteralAccounts();
		this.save(callBack);
	},
	
	authorize: function(username , password , callBack)
	{
		callBack = callBack || Mojo.doNothing;
		var url = "https://api.twitter.com/oauth/access_token",
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret},
			request = {
				method: 'POST',
				action: url,
				parameters: {
					x_auth_mode: 'client_auth',
					x_auth_password: password,
					x_auth_username: username
				}
			};
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: {
					x_auth_mode: 'client_auth',
					x_auth_password: password,
					x_auth_username: username
			},
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.authorizeSuccess.bind(this , callBack),
			onFailure: this.authorizeFailure.bind(this , callBack)
		});
	},
	
	authorizeSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		try
		{
			var q = t.responseText.parseQuery();
			this.authorizeFinish(callBack , q);
		}
		catch(e)
		{
			callBack(false);
		}
	},
	
	authorizeFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , "Authorizing your account failed.");
	},
	
	authorizeFinish: function(callBack , oauth)
	{
		callBack = callBack || Mojo.doNothing;
		var url = "https://api.twitter.com/1/users/show.json",
			accessor = {consumerKey: Twee.consumerKey , consumerSecret: Twee.consumerSecret , token: oauth.oauth_token, tokenSecret: oauth.oauth_token_secret},
			request = {
				method: 'GET',
				action: url,
				parameters: {screen_name: oauth.screen_name}
			};
		
   		OAuth.completeRequest(request , accessor);
		this.activeRequest = new Ajax.Request(url , {
			method: request.method,
			parameters: {screen_name: oauth.screen_name},
			requestHeaders: {Authorization: OAuth.getAuthorizationHeader(request.action , request.parameters)},
			onSuccess: this.authorizeFinishSuccess.bind(this , callBack , oauth),
			onFailure: this.authorizeFinishFailure.bind(this , callBack , oauth)
		});
	},
	
	authorizeFinishSuccess: function(callBack , oauth , t)
	{
		callBack = callBack || Mojo.doNothing;
		try
		{
			callBack(true , new Twee.Account().authorizeLoad(oauth , t.responseText.evalJSON()));
		}
		catch(e)
		{
			callBack(false);
		}
	},
	
	authorizeFinishFailure: function(callBack , oauth , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false , t.responseText);
	},
	
	getUserStorageKey: function(user , key)
	{
		return this.userStorageKey.replace("{username}" , user.username).replace("{key}" , key);
	},
	
	userStorageSet: function(callBack , user , key , storage , count)
	{
		callBack = callBack || Mojo.doNothing;
		count = count || 1;
		if (this.depotError || count > 5) return callBack(false);
		if (!this.depotReady) return window.setTimeout(this.userStorageSet.bind(this , callBack , user , key , storage , count+1) , 500);
		
		this.depot.add(this.getUserStorageKey(user , key) , storage ,  this.userStorageSetSuccess.bind(this , callBack) , this.userStorageSetFailure.bind(this , callBack));
	},
	
	userStorageSetSuccess: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(true);
	},
	
	userStorageSetFailure: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	userStorageGet: function(callBack , user , key , count)
	{
		callBack = callBack || Mojo.doNothing;
		count = count || 1;
		if (this.depotError || count > 5) return callBack(false);
		if (!this.depotReady) return window.setTimeout(this.userStorageGet.bind(this , callBack , user , key , count+1) , 500);
		this.depot.get(this.getUserStorageKey(user , key) ,  this.userStorageGetSuccess.bind(this , callBack) , this.userStorageGetFailure.bind(this , callBack));
	},
	
	userStorageGetSuccess: function(callBack , data)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(data);
	},
	
	userStorageGetFailure: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	}

}))();