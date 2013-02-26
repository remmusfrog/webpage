(function($){
	$.extend($.fn,{
		datePickerOpt:function(opt){
					var set = $.extend({
						minDate:"01-01-1900 0:0",
						maxDate:"10-01-2013 15:16",
						selectedDate:"01-01-1990 0:0",
						yearContainerId:"year",
						monthContainerId:"month",
						dateContainerId:"date"
					},opt);
					var DateUtil = 
					{
						format:function(date)
						{
							var date    = date.split(/\s+/);
							var dateArr = date[0].split("-");
							// var timeArr = date[1].split(":");
							return{
								month : +dateArr[0]-1,
								date  : +dateArr[1],
								year  : +dateArr[2]
								// hour  : +timeArr[0],
								// minute: +timeArr[1],
								// second: +timeArr[2]
							}
						},
						isLeapYear:function(year)
						{
							if( (year % 4 == 0 && year % 100 != 0) || year % 400 == 0)
							{
								return true;
							}else
							{
								return false;
							}
						},
						dateCal:function(month,isLeapYear)
						{
							if( month >=12 || month < 0 )
							{
								return false;
							}
							if( month == 3 || month == 5 || month == 8 || month == 10)
							{
								return 30;
							}else if( month == 1)
							{
								if(isLeapYear)
								{
									return 29;
								}else
								{
									return 28;
								}
							}else
							{
								return 31;
							}
						},
						rtnDateChar:function(val)
						{
							var tYear  = +val.getUTCFullYear();
							var tMonth = +val.getUTCMonth()+1;
							var tDate  = +val.getUTCDate();
							return tMonth+"-"+tDate+"-"+tYear+" 0:0";
						}
					}
					var Simulator =
					{
						setValue:function(type,v)
						{
							global.domSaver[type].attr("value",v);
							$('option',global.domSaver[type]).removeAttr("selected");
							$('option[value='+v+']',global.domSaver[type]).attr("selected","selected");
						},
						getValue:function(type)
						{
							return $('option[selected=selected]',global.domSaver[type]).attr("value");
						}
					}
					var global =
					{
						domSaver : {},
						wrapperSaver : {},
						viewSaver : {},
						formatMax : {},
						formatMin : {}
					}
					var Render = 
					{
						optionStr : '',
						assembleOption:function(type,value,selected,outOfLimit)
						{
							var selected = selected ? 'selected="selected"' : '';
							var disabled = outOfLimit ? ' disabled' : '';
							var tmpl ='<option class="'+type+disabled+'" '+selected+disabled+' value="'+value+'">'+value+'</option>';
							this.optionStr+=tmpl;
						},
						setOption:function(type,selectedValue)
						{
							global.domSaver[type].html(this.optionStr);
							this.optionStr='';
							Simulator.setValue(type,selectedValue);
						},
						assembleYear:function(current)
						{
							var maxYear = global.formatMax.year;
							var minYear = global.formatMin.year;
							while(minYear <= maxYear)
							{
								this.assembleOption('year',minYear,minYear==current.year);
								minYear++;
							}
							this.setOption('year',current.year);
						},
						assembleMonth:function(current)
						{
							var month = 0;
							while(month<=11)
							{
								this.assembleOption(
								'month',
								 month+1, 
								 month == current.month, 
								 ((current.year == global.formatMax.year) && (month > global.formatMax.month)) || ((current.year == global.formatMin.year) && (month < global.formatMin.month))); 
								month++;	
							}
							this.setOption('month',(current.month+1));
						},
						assembleDate:function(current)
						{
							var date = 1;
							var isLeapYear = DateUtil.isLeapYear(current.year);
							var daysInMonth = DateUtil.dateCal(current.month,isLeapYear);
							while(date <= daysInMonth)
							{
								this.assembleOption(
								'date',
								date,
								date == current.date,
								((current.year == global.formatMax.year) && (current.month == global.formatMax.month) && (date > global.formatMax.date)) || ((current.year == global.formatMin.year) && (current.month == global.formatMin.month) && (date < global.formatMin.date))
								);
								date++;
							}
							this.setOption('date',current.date);
						},
						init:function()
						{
							set.maxDate = DateUtil.rtnDateChar(new Date());
							var selectedDate = DateUtil.format(set.selectedDate);
							global.formatMax = DateUtil.format(set.maxDate);
							global.formatMin = DateUtil.format(set.minDate);
							this.setWarpper();
							this.assemble('year',selectedDate);
							this.assemble('month',selectedDate);
							this.assemble('date',selectedDate);
						},
						assemble:function(fnName,args)
						{
							fnName = fnName.replace(/^.{1}/,function(i)
							{
								return i.toUpperCase();
							});
							this['assemble'+fnName](args);
						},
						setWarpper:function()
						{
							global.domSaver.year  = $("#"+set.yearContainerId);
							global.domSaver.month = $("#"+set.monthContainerId);
							global.domSaver.date  = $("#"+set.dateContainerId);

							global.viewSaver.year  = $('option[selected=selected]',global.domSaver.year);
							global.viewSaver.month = $('option[selected=selected]',global.domSaver.month);
							global.viewSaver.date  = $('option[selected=selected]',global.domSaver.date);

						}
					}

					var Event = 
					{
						public:function(target)
						{
							Simulator.setValue($(target).attr("name"),$(target).attr('value'));
						},
						onYearChange:function(e)
						{
							Event.public(e.target);
							var year  = Simulator.getValue('year');
							var dateObj = 
							{	
								year : year,
								month : 0,
								date : 1,
								hour:0,
								minute:0,
								second:0
							}
							Render.assemble('month',dateObj);
							dateObj.month = +Simulator.getValue('month') -1;
							Render.assemble('date',dateObj);
							// dateObj.date = Simulator.getValue('date');
							// Render.assemble('hour',dateObj);
							// dateObj.hour = Simulator.getValue('hour');
							// Render.assemble('minute', dateObj);
							// dateObj.minute = Simulator.getValue('minute');
							// Render.assemble('second',dateObj);
						},
						onMonthChange:function(e)
						{
							Event.public(e.target);
							var year  = Simulator.getValue('year');
							var month = +Simulator.getValue('month') - 1;
							var dateObj = 
							{	
								year : year,
								month : month,
								date : 1,
								hour:0,
								minute:0,
								second:0
							}
							Render.assemble('date',dateObj);
							//Render.assemble('hour',dateObj);
							//dateObj.hour = Simulator.getValue('hour');
							//Render.assemble('minute', dateObj);
						},
						onDateChange:function(e)
						{
							if(Event.public(e.target) != false)
							{
								var year = Simulator.getValue('year');
								var month = Simulator.getValue('month') - 1;
								var date = Simulator.getValue('date');
								var dateObj = 
								{
									year : year,
									month : month,
									date : date,
									hour : 0,
									minute:0,
									second:0
								}
							}
						},
						onHourChange:function(e)
						{
							if(Event.public(e.target) != false)
							{
								var year = Simulator.getValue('year');
								var month = Simulator.getValue('month') - 1;
								var date = Simulator.getValue('date');
								var hour = Simulator.getValue('hour');
								var dateObj = 
								{
									year : year,
									month : month,
									date : date,
									hour : hour,
									minute:0,
									second:0
								}
							}
						},
						onMinuteChange:function(e)
						{
							if(Event.public(e.target) != false)
							{
								var year = Simulator.getValue('year');
								var month = Simulator.getValue('month') -1;
								var date = Simulator.getValue('date');
								var hour = Simulator.getValue('hour');
								var minute = Simulator.getValue('minute');
								var dateObj = 
								{
									year : year,
									month : month,
									date : date,
									hour : hour,
									minute:minute,
									second:0
								}
							}
						},
						onSecondChange:function(e)
						{
							if(Event.public(e.target) != false)
							{
								var year = Simulator.getValue('year');
								var month = Simulator.getValue('month') -1;
								var date = Simulator.getValue('date');
								var hour = Simulator.getValue('hour');
								var minute = Simulator.getValue('minute');
								var second = Simulator.getValue('second');
								var dateObj = 
								{
									year : year,
									month : month,
									date : date,
									hour : hour,
									minute:minute,
									second:second
								}
							}
						},
						init:function()
						{
							global.domSaver.year.live('change',this.onYearChange);
							global.domSaver.month.live('change',this.onMonthChange);
							global.domSaver.date.live('change',this.onDateChange);
						}
					}
					Render.init();
					Event.init();
					return{
						vSetDate:function(date)
						{
							var date = DateUtil.format(date);
							Render.assemble('year', date);
							Render.assemble('month', date);
							Render.assemble('date', date);
						},
						vGetDate:function()
						{
							var year = Simulator.getValue('year');
							var month = Simulator.getValue('month');
							var date = Simulator.getValue('date');
							return{
								year:year,
								month:month,
								date:date
							}
						}
					}
		}
	});
})(jQuery);
var cDate = $.fn.datePickerOpt();
// cDate.vSetDate('11-26-2012');

