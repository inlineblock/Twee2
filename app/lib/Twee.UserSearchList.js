Twee.UserSearchList = Class.create(Twee.UserList , {
	renderTemplate: "Main/user",
	refreshListParameters: function()
	{
		this.page = 0;
		return {callBack: this.refreshListCallBack , q: this.controller.search};
	},
	
	loadMoreListParameters: function()
	{
		this.page++;
		return {callBack: this.loadMoreListCallBack , q: this.controller.search , page: this.page};
	}
});