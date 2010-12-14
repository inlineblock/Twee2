Morsel = {
	dateTimeFormat: "%B %d, %Y %I:%M %p",
	fullDateFormat: "%B %d, %Y",
	getTimeStamp: function()
	{
		var d = new Date();
		return Math.floor(d.getTime()/1000);
	},
	
	convertDateToAlarm: function(date)
	{
		var month = (date.getUTCMonth()+1).toString(),
			day = date.getUTCDate().toString(),
			year = date.getUTCFullYear().toString(),
			hours = date.getUTCHours().toString(),
			minutes = date.getUTCMinutes().toString(),
			seconds = date.getUTCSeconds().toString();
		if (month.length != 2)
		{
			month = "0" + month;
		}
		if (day.length != 2)
		{
			day = "0" + day;
		}
		if (hours.length != 2)
		{
			hours = "0" + hours;
		}
		if (minutes.length != 2)
		{
			minutes = "0" + minutes;
		}
		if (seconds.length != 2)
		{
			seconds = "0" + seconds;
		}
		return month + '/' + day + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
	}
};
String.prototype.trim = function() 
{
	var	str = this.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}
String.prototype.localize = function()
{
	return $L(this);
}

String.prototype.compare = function(string)
{
	if (this == string)
	{
		return 0;
	}
	
	if (this.length != string.length)
	{
		if (this.length > string.length)
		{
			return 1;
		}
		else
		{
			return -1;
		}
	}
	
	var i=0 , strlen = this.length, mine = false , theirs = false;
	while(i < strlen)
	{
		mine = this.substr(i,1);
		theirs = string.substr(i,1);
		if (mine != theirs)
		{
			if (parseInt(mine) > parseInt(theirs))
			{
				return 1;
			}
			else
			{
				return -1;
			}
		}
		i++;
	}
	return 0;
};
String.prototype.isGreaterThan = function(string)
{
	return (this.compare(string) === 1);
};
String.prototype.isLessThan = function(string)
{
	return (this.compare(string) === -1);
}