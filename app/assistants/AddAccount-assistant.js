AddAccountAssistant = Class.create(Twee.Base , {
	Binds: ['noAccountClick' , 'loginClick' , 'authorizeCallBack'],
	
	signup: 'https://mobile.twitter.com/signup',
	
	setup: function()
	{
		this.altBackground();
		this.usernameModel = {value:''};
		this.passwordModel = {value:''};
		
		this.loginButton = this.get('loginButton');
		this.noAccountButton = this.get('noAccountButton');
		
		this.controller.setupWidget('username' , {hintText: "username" , multiline: false, enterSubmits: false, focus: true , textCase: Mojo.Widget.steModeLowerCase} , this.usernameModel);
		this.controller.setupWidget('password' , {hintText: "password" , multiline: false, enterSubmits: false, focus: false} , this.passwordModel);
		
		this.controller.setupWidget('loginButton' , {label: $L("Sign In")} , { buttonClass: "tweeButton" , buttonLabel: $L("Sign In") });
		this.controller.setupWidget('noAccountButton' , {label: $L("No account?")} , { buttonClass: "secondary" , buttonLabel: $L("No account?")});
		
		
		this.noAccountButton.observe(Mojo.Event.tap , this.noAccountClick);
		this.loginButton.observe(Mojo.Event.tap , this.loginClick);
	},
	
	cleanup: function()
	{
		this.noAccountButton.stopObserving(Mojo.Event.tap , this.noAccountClick);
		this.loginButton.stopObserving(Mojo.Event.tap , this.loginClick);
	},
	
	noAccountClick: function(evt)
	{
		this.controller.serviceRequest('palm://com.palm.applicationManager' , {
          method: 'open',
          parameters: {id: 'com.palm.app.browser' , params: { target: this.signup }}
        });
	},
	
	loginClick: function()
	{
		var u = this.usernameModel.value,
			p = this.passwordModel.value;
		if (!u || !p)
		{
			return this.errorDialog('You must enter in your username and password.');
		}
		this.showLoading("Authorizing...");
		Twee.AccountManager.authorize(u , p , this.authorizeCallBack);
	},
	
	authorizeCallBack: function(worked , data)
	{
		if (worked)
		{
			data.save(this.saveAccountCallBack.bind(this , data));
			this.showLoading("Saving...");
		}
		else
		{
			this.errorDialog(data || 'Error authorizing your request. Try again later.');
			this.hideLoading();
		}
	},
	
	saveAccountCallBack: function(user , worked)
	{
		if (!worked)
		{
			this.errorDialog('Error saving your user. Try again later.');
		}
		else
		{
			this.pop({reload:true});
		}
		this.hideLoading();
	}
});