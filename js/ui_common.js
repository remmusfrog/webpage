function addEvent(el, eventname, func)//addEventlistener
{
    if (el.addEventListener) {
        el.addEventListener(eventname, func, false);
    } else if (el.attachEvent) {
        el.attachEvent("on" + eventname, func);
    }
}

$(function(){
	function cancelBub(e){	//取消冒泡
		var e = e || window.event;
		if(e.stopPropagation){
			e.stopPropagation();
		}else{
			e.cancelBubble = true;
		}
	}
	/*************** 
	*	ui-select toggle 
	*	notice    根据default值 选中默认项 待添加
	*   通过给隐藏域赋值来 选中匹配项 需要在 赋值后触发change()事件
	****************/
	addEvent(window, onload, eachUiSelect);
	function eachUiSelect(){//遍历ui-select
		$(".ui-select:not(.disabled)").each(function(){
			var dataVal = $.trim($(this).find(".input-hidden").val());
			if( dataVal != "" && dataVal!=null){//根据初始化的val值 标记li选中项
				var selectedItem = $('li:not(.disabled)[data-value='+dataVal+']',$(this));
				selectedItem.addClass("ui-selected").siblings().removeClass("ui-selected");
				$(this).find(".val").text(selectedItem.text()).attr("data-value",dataVal);
				$(this).find(".input-hidden").val(dataVal);
				$(this).find(".input-hidden").attr("data-txt",selectedItem.text());
				$(this).find(".val").prev().replaceWith(selectedItem.find(".ui-icon").clone());
			}else{
				$('li:not(.disabled)',$(this)).removeClass("ui-selected");
				$(this).find(".input-hidden").val("").removeAttr("data-txt");
				$(this).find(".val").removeAttr("data-value");
			}
		});
	};
	$(".ui-select:not(.disabled) .input-hidden").live("change", function(){
		var dataVal = $.trim($(this).val());
		var selectedItem = $(this).parents(".ui-select").find("li:not(.disabled)[data-value="+dataVal+"]");
		selectedItem.addClass("ui-selected").siblings().removeClass("ui-selected");
		$(this).attr("data-txt",selectedItem.text());
		$(this).parents(".ui-select").find(".val").prev().replaceWith(selectedItem.find(".ui-icon").clone());
		$(this).parents(".ui-select").find(".val").text(selectedItem.text()).attr("data-value",dataVal);
	});
	$(".ui-select .ui-select-head").live("click", function(){
		var state = $(this).parent().hasClass("on") && !$(this).parent().hasClass("disabled") ? true : false;
		$(".ui-select:not(.disabled)").removeClass("on");
		if(state){
			$(this).parent().removeClass("on");
		}else{
			$(this).parent().addClass("on");
		}
	});
	$(".ui-select:not(.disabled) li:not(.disabled)").live("click", function(){
		var text   = $.trim($(this).text());
		var dataVal = $.trim($(this).attr("data-value"));
		$(this).addClass("ui-selected").siblings().removeClass("ui-selected");
		$(this).parents(".ui-select").find(".val").text(text).attr("data-value",dataVal);
		$(this).parents(".ui-select").find(".input-hidden").val(dataVal).attr("data-txt",text);
		$(this).parents(".ui-select").removeClass("on");
	});
	$(document).click(function(){
		$(".ui-select").removeClass("on");
	});
	$(".ui-select").live("click",function(e){
		cancelBub(e);//取消冒泡
	});
});