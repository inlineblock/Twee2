SupportAssistant = Class.create(Twee.Base , {
	Binds: ['handleListTap'],
	setup: function()
	{
		this.altBackground();
		
		this.controller.get('appname').innerHTML = Mojo.Controller.appInfo.title;
		this.controller.get('appdetails').innerHTML = Mojo.Controller.appInfo.version + " by " + Mojo.Controller.appInfo.company;
		this.get('copyright').innerHTML = "&copy; " + Mojo.Controller.appInfo.copyright;
		
		var supportitems = [];
		if(SupportInfo.publisherURL)
		{
			supportitems.push({text: "DeliciousMorsel.com", detail: SupportInfo.publisherURL , Class: 'img_web' , type:'web'});
		}
		/*if(SupportInfo.supportURL)
		{
			supportitems.push({text: 'Support Website' , detail: SupportInfo.supportURL , Class:"img_web", type:'web'});
		}*/
		if(SupportInfo.supportEmail)
		{
			supportitems.push({text: SupportInfo.supportEmail , address: SupportInfo.supportEmail , subject: Mojo.Controller.appInfo.title + " v" + Mojo.Controller.appInfo.version + " Support", Class:"img_email" , type:'email'});
		}
		
		supportitems.push({text: "Follow @DeliciousMorsel", detail: "deliciousmorsel" , Class: 'img_follow' , type:'follow'});
		
		this.controller.setupWidget('AppSupport_list', 
		    {
				itemTemplate:'Support/listitem', 
				listTemplate:'Support/listcontainer',
				emptyTemplate:'Support/emptylist',
				swipeToDelete: false						
			},
		    {
				listTitle: $L('Support'),
	            items : supportitems
	         }
		);
		
		this.controller.get('AppSupport_list').observe(Mojo.Event.listTap , this.handleListTap);
		
	},
	
	handleListTap: function(event)
	{
		  if(event.item.type == 'web')
		  {
		  	this.controller.serviceRequest("palm://com.palm.applicationManager", {
			  method: "open",
			  parameters:  {
			      id: 'com.palm.app.browser',
			      params: {
			          target: event.item.detail
			      }
			  }
			});
		  }	  
		  else if(event.item.type == 'email')
		  {
		  	this.controller.serviceRequest('palm://com.palm.applicationManager', {
			    method:'open',
			    parameters:{ target: 'mailto:' + event.item.address + "?subject=" + event.item.subject}
			});	
		  }
		  else if(event.item.type == 'phone')
		  {
		  	this.controller.serviceRequest('palm://com.palm.applicationManager', {
			    method:'open',
			    parameters: {
			       target: "tel://" + event.item.detail
			       }
			    });	
		  }
		  else if(event.item.type == 'scene')
		  {
		  	this.controller.stageController.pushScene(event.item.detail);	
		  }
		  else if(event.item.type == 'follow')
		  {
		  	this.controller.serviceRequest("palm://com.palm.applicationManager", {
			  method: "open",
			  parameters:  {
			      id: 'com.deliciousmorsel.twee',
			      params: {
			          follow: event.item.detail
			      }
			  }
			});
		  }
	},

	cleanup: function(event)
	{
		Mojo.Event.stopListening(this.controller.get('AppSupport_list'),Mojo.Event.listTap,this.handleListTap)
	}
});