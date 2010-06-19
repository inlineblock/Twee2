Twee.TrendView = Class.create({
	loadingTweetsClassName: 'loading',
	errorClassName: 'error',
	
	URLTrendTemplate: 'Main/url-trend',
	trendTemplate: 'Main/trend',
	WTTrendTemplate: 'Main/what-the-trend',
	
	initialize: function(o)
	{
		this.controller = o.controller;
		this.account = o.account;
		this.scroller = o.scroller;
		
		this.refreshIconClick = this.refreshIconClick.bind(this);
		this.getURLTrendsCallBack = this.getURLTrendsCallBack.bind(this);
		this.getTrendsCallBack = this.getTrendsCallBack.bind(this);
		this.trendListClick = this.trendListClick.bind(this);
		this.urlTrendListClick = this.urlTrendListClick.bind(this);
		
		this.whatTheTrendClose = this.whatTheTrendClose.bind(this);
		this.whatTheTrendCallBack = this.whatTheTrendCallBack.bind(this);
		
		this.options = {};
		this.trends = [];
		this.urlTrends = [];
		this.loaded = false;
	},
	
	setup: function(id)
	{
		this.element = this.controller.get(id);
		this.refreshIcon = this.element.down('.refresh-icon');
		this.refreshIcon.observe(Mojo.Event.tap , this.refreshIconClick);
		
		this.trendList = this.element.down('.trend-list');
		this.urlTrendList = this.element.down('.url-trend-list');
		this.trendListFooter = this.element.down('#trend-list-footer');
		
		this.trendList.observe(Mojo.Event.tap , this.trendListClick);
		this.urlTrendList.observe(Mojo.Event.tap , this.urlTrendListClick);
		
		this.element.widget = this;
		return this;
	},
	
	cleanup: function()
	{
		this.refreshIcon.stopObserving(Mojo.Event.tap , this.refreshIconClick);
		this.trendList.stopObserving(Mojo.Event.tap , this.trendListClick);
		this.urlTrendList.stopObserving(Mojo.Event.tap , this.urlTrendListClick);
	},
	
	activate: function()
	{
		this.readjustScrollTop();
		if (!this.element.hasClassName(this.loadingTweetsClassName) && !this.loaded)
		{
			window.setTimeout(this.refreshLists.bind(this) , 50);
		}
	},
	
	aboutToDeactivate: function()
	{
		this.setOptions();
	},
	
	refreshLists: function()
	{
		if (!this.element.hasClassName(this.loadingTweetsClassName))
		{
			this.scroller.scrollTop = 0;
			this.urlTrendList.innerHTML = "";
			this.trendList.innerHTML = "";
			this.trendListFooter.innerHTML = "updating ..."
			this.urlTrendList.removeClassName(this.errorClassName);
			this.trendList.removeClassName(this.errorClassName);
			this.element.addClassName(this.loadingTweetsClassName);
			this.account.getURLTrends({callBack: this.getURLTrendsCallBack});
			this.account.getTrends({callBack: this.getTrendsCallBack});
			this.urlTrendsInProgress = true;
			this.trendsInProgress = true;
		}
	},
	
	getURLTrendsCallBack: function(worked , data)
	{
		if (worked && Object.isArray(data))
		{
			var html = [];
			data.each(function(trend) {
				html.push(Mojo.View.render({object: trend , template: this.URLTrendTemplate}));
			} , this);
			this.urlTrendList.innerHTML = html.join('');
		}
		else
		{
			this.urlTrendList.addClassName(this.errorClassName);
			this.urlTrendList.innerHTML = "Error Loading URL Trends.";
		}
		this.urlTrendsInProgress = false;
		this.getTrendFinish();
	},
	
	getTrendsCallBack: function(worked , data , date)
	{
		if (worked && Object.isArray(data))
		{
			var html = [];
			data.each(function(trend) {
				html.push(Mojo.View.render({object: trend , template: this.trendTemplate}));
			} , this);
			this.trendList.innerHTML = html.join('');
			this.trendListFooter.innerHTML = "Last Updated on " + date.format(Morsel.dateTimeFormat);
		}
		else
		{
			this.trendList.addClassName(this.errorClassName);
			this.trendList.innerHTML = "Error Loading Trends.";
			this.trendListFooter.innerHTML = "";
		}
		this.trendsInProgress = false;
		this.getTrendFinish();
	},
	
	getTrendFinish: function()
	{
		if (!this.urlTrendsInProgress && !this.trendsInProgress)
		{
			this.element.removeClassName(this.loadingTweetsClassName);
			this.loaded = true;
		}
	},
	
	readjustScrollTop: function()
	{
		if (this.element.hasClassName('show'))
		{
			if (this.options && this.options.scrollTop)
			{
				this.scroller.scrollTop = this.options.scrollTop + (this.element.offsetHeight - this.options.offsetHeight);
			}
			else
			{
				this.scroller.scrollTop = 0;
			}
			this.setOptions();
		}
	},
	
	refreshIconClick: function()
	{
		this.refreshLists();
	},
	
	setOptions: function()
	{
		this.options = {scrollTop: this.scroller.scrollTop , offsetHeight: this.element.offsetHeight};
	},
	
	trendListClick: function(evt)
	{
		var el = evt.target;
		if (el.hasClassName('info-icon'))
		{
			return this.showWhatTheTrend(el.up('.trend-item').down('.title').innerHTML);
		}
		if (!el.hasClassName('trend-item'))
		{
			el = el.up('.trend-item');
		}
		if (!el)
		{
			return false;
		}
		this.controller.push('ViewSearch' , {account: this.account , search: el.down('.title').innerHTML});
	},
	
	urlTrendListClick: function(evt)
	{
		var el = evt.target;
		if (!el.hasClassName('url-trend-item'))
		{
			el = el.up('.url-trend-item');
		}
		if (!el)
		{
			return false;
		}
		this.controller.openBrowser(el.down('.url').innerHTML);
	},
	
	showWhatTheTrend: function(title)
	{
		Mojo.Log.info(title);
		var loading = this.controller.showLoading();
		loading.observe(Mojo.Event.tap , this.whatTheTrendClose);
		this.wttLoading = true;
		
		this.account.getWhatTheTrend({callBack: this.whatTheTrendCallBack , trend: title});
	},
	
	whatTheTrendCallBack: function(worked , response)
	{
		this.wttLoading = false;
		this.whatTheTrendCloseLoading();
		if (!worked)
		{
			this.controller.errorDialog("Unable to load WhatTheTrend.com trend description.");
		}
		else
		{		
			this.wttScrim = new Element('div' , {className: 'scrim'});
			this.wttScrim.innerHTML = Mojo.View.render({object: response , template: this.WTTrendTemplate})
			this.controller.scroller.appendChild(this.wttScrim);
			
			this.wttScrim.observe(Mojo.Event.tap , this.whatTheTrendClose);
		}
	},
	
	whatTheTrendClose: function()
	{
		if (this.wttLoading)
		{
			this.whatTheTrendCloseLoading();
		}
		else
		{
			this.wttScrim.stopObserving(Mojo.Event.tap , this.whatTheTrendClose);
			this.wttScrim.remove();
			delete this.wttScrim;
		}
	},
	
	whatTheTrendCloseLoading: function()
	{
		var loading = this.controller.showLoading();
		loading.stopObserving(Mojo.Event.tap , this.whatTheTrendClose);
		this.controller.hideLoading();
	}
});