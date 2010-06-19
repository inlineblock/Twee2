Twee.AccountServicesScrubbers = {
	scrubTweetParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['status' , 'long' , 'lat' , 'display_coordinates' , 'in_reply_to_status_id'];
		if (o.location)
		{
			o.long = o.location.longitude;
			o.lat = o.location.latitude;
		}
		if (o.reply)
		{
			o.in_reply_to_status_id = o.reply.id;
		}
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	},
	
	scrubDirectMessageParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['screen_name' , 'text'];
		o.screen_name = o.screen_name || o.username;
		o.text = o.text || o.status;
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	},
	
	scrubBasicParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['page' , 'max_id' , 'since_id' , 'screen_name'];
		params.count = o.count || 50;
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	},
	
	scrubBasicListParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['page' , 'max_id' , 'since_id' , 'screen_name'];
		params.per_page = o.count || 50;
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	},
	
	scrubUsersListParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['cursor' , 'screen_name'];
		params.count = o.count || 50;
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	},
	
	scrubUserSearchParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['q' , 'page' , 'per_page'];
		params.per_page = o.count || 50;
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	},
	
	scrubSearchParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['q' , 'page' , 'geocode' , 'since_id' , 'result_type'];
		params.rpp = o.count || 50;
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	},
	
	scrubUserParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['screen_name'];
		o.screen_name = o.username || o.screen_name;
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	},
	
	scrubFavoritesParameters: function(o)
	{
		o = o || {};
		var params = {}, xCheck = ['page' , 'id'];
		params.count = o.count || 50;
		xCheck.each(function(x) {
			if (o[x])
			{
				params[x] = o[x];
			}
		} , this);
		
		return params;
	}

};

Twee.Account.addMethods(Twee.AccountServicesScrubbers);