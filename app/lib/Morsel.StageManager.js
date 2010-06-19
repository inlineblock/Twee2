Morsel.StageManager = Class.create({
	controller: false,
	
	initialize: function(controller)
	{
		this.controller = controller;
	},
	
	getStage: function(uniqueid)
	{
		if (!uniqueid) return false;
		var appController = Mojo.Controller.getAppController();
		return appController.getStageController(uniqueid);
	},
	
	stageExists: function(uniqueid)
	{
		return (this.getStage(uniqueid) ? true : false);
	},
	
	newCard: function(uniqueid , stage , o)
	{
		if (!uniqueid) return false;
		if (!stage) var stage = uniqueid;
		
		o = o || {};
		var appController = Mojo.Controller.getAppController();
		
		var stageController = this.getStage(uniqueid);
		if (stageController)
		{
			stageController.window.focus();
		}
		else
		{
			
			var stageArguments = {'name': uniqueid , lightweight: true},
			pushScene = function(stageController)
			{
				stageController.pushScene(stage , o);
			};
			appController.createStageWithCallback(stageArguments , pushScene , Mojo.Controller.StageType.card);
		}
	},
	
	newPopup: function(uniqueid , stage , o)
	{
		if (!uniqueid) return false;
		if (!stage) var stage = uniqueid;
		
		o = o || {};
		
		var appController = Mojo.Controller.getAppController();
		
		var stageController = this.getStage(uniqueid);
		if (stageController)
		{
			stageController.window.focus();
		}
		else
		{
			
			var stageArguments = {'name': uniqueid , lightweight: true},
			pushScene = function(stageController)
			{
				stageController.pushScene(stage , o);
			};
			appController.createStageWithCallback(stageArguments , pushScene , Mojo.Controller.StageType.popupAlert);
		}
	},
	
	newDashboard: function(uniqueid , stage , o)
	{
		if (!uniqueid) return;
		if (!stage) var stage = uniqueid;
		o = o || {};
		var appController = Mojo.Controller.getAppController();
		
		var stageController = this.getStage(uniqueid);
		if (stageController)
		{
			stageController.window.focus();
		}
		else
		{
			
			var stageArguments = {'name': uniqueid , lightweight: true},
			pushScene = function(stageController)
			{
				stageController.pushScene(stage , o);
			};
			appController.createStageWithCallback(stageArguments , pushScene , Mojo.Controller.StageType.dashboard);
		}
	},
	
	close: function(uniqueid)
	{
		if (!uniqueid) return;
		var appController = Mojo.Controller.getAppController();
		appController.closeStage(uniqueid)
	},
	
	closeDashboard: function(uniqueid)
	{
		var stage = this.getStage(uniqueid);
		var scene = stage.activeScene();
		scene.assistant.close();
	}
	
});