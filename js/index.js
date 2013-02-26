var common = {
    setCookie: function (name, val) 
    {
        document.cookie = name + "=" + val;
    },
    getCookie: function (name) 
    {
        var tmpStr = document.cookie;
        var tmpArr = tmpStr.split(";");
        for (var i = 0; i < tmpArr.length; i++)
        {
            var arr = tmpArr[i].split("=");
            if (!arr[1]) 
            {
                return "";
            } else if (arr[0] == name) 
            {
                return arr[1];
            }
        }
        return "";
    },
    delCookie: function (name) 
    {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cVal = this.getCookie(name);
        if (cVal != null) 
        {
            document.cookie = name + "=" + cVal + ";expires=" + exp.toGMTString();
        }
    },
    setCookieArr: function () 
    {
        var dd = document.getElementById("content-dl").getElementsByTagName('dd');
        var preStr = '{ classname:"default",val:[';
        var tmpArr = preStr;
        for (var i = 0; i < dd.length; i++) 
        {

            var tmpStr = '';
            var div = dd[i].getElementsByTagName('div');
            for (var j = 0; j < div.length; j++) 
            {
                var enable = div[j].style.display == "none" ? false : true;
                tmpStr += (tmpStr == "" ? "" : ",") + '{ id:"' + div[j].id + '", enable:' + enable + '}'
            }
            tmpArr += (tmpArr == preStr ? "" : ",") + "[" + tmpStr + "]";
        }
        tmpArr += "]}";
        // console.log(tmpArr);
        this.setCookie("cookieArr", tmpArr);
    },
    getSortArr: function () 
    {
        var dd = document.getElementById("content-dl").getElementsByTagName('dd');
        var preStr = '[';
        var tmpArr = preStr;
        for (var i = 0; i < dd.length; i++) 
        {

            var tmpStr = '';
            var div = dd[i].getElementsByTagName('div');
            for (var j = 0; j < div.length; j++) 
            {
                var enable = div[j].style.display == "none" ? false : true;
                tmpStr += (tmpStr == "" ? "" : ",") + '{ id:"' + div[j].id + '", enable:' + enable + '}'
            }
            tmpArr += (tmpArr == preStr ? "" : ",") + "[" + tmpStr + "]";
        }
        return tmpArr + "]";
    },
    getCookieArr: function () {
        if (this.getCookie("cookieArr")) 
        {
            // console.log(this.getCookie("cookieArr"));
            var cookieArr = eval("(" + this.getCookie("cookieArr") + ")");
            console.log(cookieArr);
            appendData(cookieArr);
            // var dd = document.getElementById("content").getElementsByTagName('dd');
            // for(var i=0; i<dd.length;i++)
            // {
            // 	for(var j=0; j<cookieArr[i].length;j++)
            // 	{
            // 		console.log(j);
            // 		dd[i].appendChild(document.getElementById(cookieArr[i][j]));
            // 	}
            // }	
        }
    }
}


function drag(el, titleBar, container) 
{
    this.container = document.getElementById(container);
    this.box = document.getElementById(el);
    this.titleBar = document.getElementById(titleBar);
    this._move = false;
    this._x = 0;
    this._y = 0;
    this.maxLeft = null;
    this.maxTop = null;
    this.dragArr = null;
    this.pos = null;
    this.dashedElement = null;
    this.cIdPos = null;
    this.duplicate = null;
}

drag.prototype.getEvent = function (e)//event兼容
{
    e = e || window.event;
    return e;
}

drag.prototype.getMousePos = function (e)//获取鼠标坐标
{
    var e = this.getEvent(e);
    if (e.pageX || e.pageY) 
    {
        return { x: e.pageX, y: e.pageY }
    } else 
    {
        return {
            x: e.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: e.clientY + document.body.scrollTop - document.body.clientTop
        }
    }
}

drag.prototype.getElementPos = function (el)//获取元素position
{
    var _x = 0, _y = 0;
    do {
        _x += el.offsetLeft;
        _y += el.offsetTop;
    } while (el = el.offsetParent);
    return { x: _x, y: _y }
}

drag.prototype.cancelDefaultEvent = function (e)//取消img、a等元素默认行为
{
    var e = this.getEvent(e);
    var targ = e.target ? e.target : e.srcElement;
    if (targ.nodeType == 3) {
        targ = targ.parentNode;
    }

    if (targ.tagName == "IMG") {
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    }

    return false;
}

drag.prototype.cancelSelect = function () 
{
    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
}

drag.prototype.addEvent = function (el, eventname, func)//addEventlistener
{
    if (el.addEventListener) {
        el.addEventListener(eventname, func, false);
    } else if (el.attachEvent) {
        el.attachEvent("on" + eventname, func);
    }
}

drag.prototype.fChild = function (el, tagname) 
{
    var arr = el.getElementsByTagName(tagname);
    return arr[0];
}

drag.prototype.lChild = function (el, tagname) 
{
    var arr = el.getElementsByTagName(tagname);
    return arr[arr.length - 1];
}

drag.prototype.getZindex = function () 
{
    var maxZindex = 0;
    var cont = this.container;
    var div = cont.getElementsByTagName('div');
    for (var i = 0; i < div.length; i++) 
    {
        maxZindex = Math.max(maxZindex, div[i].style.zIndex);
    }
    return maxZindex;
}

drag.prototype.insertAfter = function (newElement, targetElement)//将新元素插入到目标元素之后
{
    if (targetElement.nextSibling) 
    {
        targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling);
    } else 
    {
        targetElement.parentNode.appendChild(newElement);
    }

}
drag.prototype.getDragArr = function ()//获取所有可拖拽元素的position
{
    var arr = [];
    var cont = this.container;
    var div = cont.getElementsByTagName('div');
    for (var i = 0; i < div.length; i++) 
    {
        var tmpDiv = div[i];
        if (tmpDiv.className.indexOf("widget-item") != -1) 
        {
            var tmpPos = this.getElementPos(tmpDiv);
            arr.push({
                elId: tmpDiv.id,
                posL: tmpPos.x,
                posT: tmpPos.y,
                posW: tmpDiv.offsetWidth,
                posH: tmpDiv.offsetHeight
            });
        }
    }
    return arr;
}
drag.prototype.dragStart = function (e) 
{
    var eV = this.getEvent(e);
    if (eV.button == 2)//禁止右键拖拽
    {
        return false;
    }
    this.cancelSelect();
    this.cancelDefaultEvent(e);
    var that = this;
    that.pos = that.getMousePos(e);
    that._move = true;
    that._x = that.pos.x - that.box.offsetLeft;
    that._y = that.pos.y - that.box.offsetTop;
    that.dragArr = that.getDragArr();
    var cont = that.container;
    var dd = document.getElementById("content-dl").getElementsByTagName('dd');
    var tmpCid;
    for (var i = 0; i < dd.length; i++) 
    {
        var div = dd[i].getElementsByTagName('div');
        for (var j = 0; j < div.length; j++) 
        {
            if (div[j].id == that.box.id) 
            {
                tmpCid = i;
                break;
            }
        }
    }

    var tmpFirstChild = that.getElementPos(that.fChild(dd[tmpCid], "div"));
    var tmpLastChild = that.getElementPos(that.lChild(dd[tmpCid], "div"));
    that.cIdPos = {
        cId: tmpCid,
        firstChildUp: tmpFirstChild.y,
        lastChildDown: tmpLastChild.y + that.lChild(dd[tmpCid], "div").offsetHeight
    };
    that.dashedElement = document.createElement("div");
    that.dashedElement.style.cssText = that.box.cssText;
    that.dashedElement.style.border = "2px dashed #AAA";
    that.dashedElement.style.width = that.box.offsetWidth - 2 * parseInt(that.dashedElement.style.borderWidth) + "px";
    that.dashedElement.style.height = that.box.offsetHeight - 2 * parseInt(that.dashedElement.style.borderWidth) + "px";
    that.dashedElement.style.marginBottom = "10px";
    that.dashedElement.style.position = "relative";
    that.box.parentNode.insertBefore(that.dashedElement, that.box); //将虚线框插入到当前拖拽对象之后
    that.duplicate = document.createElement("div");
    that.duplicate.style.width = that.box.offsetWidth - 2 * that.box.clientLeft + "px";
    that.duplicate.style.height = that.box.offsetHeight - 2 * that.box.clientLeft + "px";
    that.duplicate.style.opacity = 0.5;
    that.duplicate.style.border = "1px solid #AAA";
    that.duplicate.style.background = "#CCC";
    that.duplicate.style.position = "absolute";
    that.duplicate.style.zIndex = that.getZindex() + 1;
    that.box.parentNode.insertBefore(that.duplicate, that.box);
    that.box.style.opacity = "0.6";
    that.pos = that.getMousePos(e);
    that.duplicate.style.left = Math.max(Math.min(that.maxLeft, that.pos.x - that._x), 0) + "px";
    that.duplicate.style.top  = Math.max(Math.min(that.maxTop,  that.pos.y - that._y), 0) + "px";
}
drag.prototype.dragMove = function (e) 
{
	this.cancelSelect();
	this.cancelDefaultEvent(e);
	var that =this;
	if(that._move)
	{
		that.pos = that.getMousePos(e);
		that.duplicate.style.left = Math.max(Math.min(that.maxLeft, that.pos.x - that._x), 0) + "px";
		that.duplicate.style.top  = Math.max(Math.min(that.maxTop,  that.pos.y - that._y), 0) + "px";
		var targetDiv = null;
		for(var i=0; i<that.dragArr.length; i++)
		{
			if( that.dragArr[i].elId == that.box.id)
			{
				continue;
			}
			if( that.pos.x > that.dragArr[i].posL && that.pos.x < that.dragArr[i].posL + that.dragArr[i].posW && that.pos.y > that.dragArr[i].posT && that.pos.y < that.dragArr[i].posT + that.dragArr[i].posH)//当前拖拽对象位于可拖拽对象中时
			{
				targetDiv = document.getElementById(that.dragArr[i].elId);
				that.dashedElement.width  = targetDiv.offsetWidth  - 2 * parseInt(that.dashedElement.style.borderWidth) + "px";
				if(that.pos.y < that.dragArr[i].posT + that.dragArr[i].posH / 2)//往上移
				{
					var abc = targetDiv.parentNode.insertBefore(that.dashedElement,targetDiv); //此处insertBefore插入不成功
				}else//往下移
				{
					that.insertAfter(that.dashedElement, targetDiv);
				}

			}
		}
		var dd = document.getElementById("content-dl").getElementsByTagName('dd');
		for(var j=0; j<dd.length; j++)
		{
			var startLeft = that.getElementPos(dd[j]).x;
			if(that.pos.x > startLeft && that.pos.x < startLeft + dd[j].offsetWidth)
			{
				that.dashedElement.style.width = dd[j].offsetWidth - 2 * parseInt(that.dashedElement.style.borderWidth) + "px";
				if(dd[j].getElementsByTagName('div').length == 0)
				{
					dd[j].appendChild(that.dashedElement);
				}else
				{
					var posFirstChild = that.getElementPos(that.fChild(dd[j],"div"));
					var posLastChild  = that.getElementPos(that.lChild(dd[j],"div"));
					var tmpUp,tmpDown;
					if(that.cIdPos.cId == j)
					{
						tmpUp   = that.cIdPos.firstChildUp;
						tmpDown = that.cIdPos.lastChildDown;
					}else
					{
						tmpUp   = posFirstChild.y;
						tmpDown = posLastChild.y + that.lChild(dd[j],"div").offsetHeight;
					}
					if(that.pos.y < tmpUp)
					{
						dd[j].insertBefore(that.dashedElement,that.fChild(dd[j],"div"));
					}else if(that.pos.y > tmpDown)
					{
						dd[j].appendChild(that.dashedElement);
					}
				}
			}
		}
	}
}
drag.prototype.dragUp = function(e)
{
	var that = this;
	if(that._move)
	{
		that.cancelDefaultEvent(e);
		that._move = false;
		that._x    = 0;
		that._y    = 0;
		that.duplicate.style.left = "";
		that.duplicate.style.top  = "";
		that.duplicate.style.width = "";
		that.duplicate.style.height = "";
		that.duplicate.style.position = "";
		that.duplicate.parentNode.removeChild(that.duplicate);
		that.box.style.opacity  = "";
		that.dashedElement.parentNode.insertBefore(that.box,that.dashedElement);
		that.dashedElement.parentNode.removeChild(that.dashedElement);
		//var index = $("#nav-home li.on").index();
		//var id = $("#hidden-sort-id").val();
		//UpdateConfigData(id, index, common.getSortArr());
	}
}
drag.prototype.init = function()
{
	if(this.box != null)
	{
		var that = this;
		this.maxLeft = this.container.offsetWidth - this.box.offsetWidth - 2 * this.container.clientLeft;
		this.maxTop = this.container.offsetHeight - this.box.offsetHeight - 2 * this.container.clientTop;
		that.addEvent(that.titleBar,"mousedown",function(e){that.dragStart(e)});
		that.addEvent(document,"mousemove",function(e){that.dragMove(e)});
		that.addEvent(document,"mouseup",function(e){that.dragUp(e)});
		var tagA = that.titleBar.getElementsByTagName('a');
		var tagDiv = $('.ui-add-btn');

		for(var i=0; i<tagA.length; i++)
		{
			tagA[i].onmousedown = function(e)
			{
				var e = that.getEvent(e);
				if(e && e.stopPropagation)
				{
					e.preventDefault();
					e.stopPropagation();
				}else
				{
					e.returnValue = false;
					e.cancelBubble = true;
				}
			}
		}

	    $(tagDiv).each(function (index, item) 
	    {
	        item.onmousedown = function (e) 
	        {
	            var e = that.getEvent(e);
	            if (e && e.stopPropagation) 
	            {
	            	e.preventDefault();
	                e.stopPropagation();
	            } else 
	            {
	            	e.returnValue = false;
	                e.cancelBubble = true;
	            }
	        }
	     });
   } 
}

function appendData(data)
{
    if (data != null) 
    {
        var val = data.Id;
        $("#hidden-sort-id").val(val);
        var data = data.Value;

		$.each(data,function(index,item)
		{
			$.each(item,function(subIndex,subItem)
			{
				var id = subItem.id;
				if(subItem.enable) //设置可见性
					{
						$("#"+id).show();
					}else
					{
						$("#"+id).hide();
					}
				$("#"+id).appendTo($("#content-dl dd").eq(index));
			});
		});
	}
}
window.onload = function()
{
	common.getCookieArr();	
	var feedback = new drag("feedback-drag","drag-title","content");//初始化拖拽对象
		feedback.init();
	var todolist = new drag("todolist-drag","todolist-title","content");
		todolist.init();
	var LeastPerforming = new drag("LeastPerforming-drag","LeastPerforming-title","content");
		LeastPerforming.init();
	var todolistTable = new drag("todolist-table-drag","todolist-table-title","content");
		todolistTable.init();
	var activeChannel = new drag("activeChannel-drag","activeChannel-title","content");
		activeChannel.init();
	var bestPPub = new drag("bestPPub-drag","bestPPub-title","content");
		bestPPub.init();
	var scheduled = new drag("scheduled-drag","scheduled-title","content");
		scheduled.init();

	$("#nav-home li").click(function()
	{
		var data =  getData($(this).index());
		// console.log(data);
		appendData(data); 
	});					
	var items = document.getElementById('content');//遍历ul[1]的最后一个li 给style样式
	if(items != null)
	{
		var dd  = items.getElementsByTagName('dd');
		for(var i=0; i< dd.length; i++)
		{
			var  div = dd[i].getElementsByTagName('div');
			for(var j=0; j<div.length; j++)
			{
				var ul = div[j].getElementsByTagName('ul');
				if(ul.length>1)
				{
					var  li = ul[ul.length - 1].getElementsByTagName('li');
					if(li.length>0)
					{
						li[li.length -1].style.borderColor = "#A29490";		
					}
				}
					
			}			
		}
	}
}

$(function(){//导航状态样式切换

	$("#header-nav li:not(.disable)").click(function()//顶部导航切换
	{
		var index = $(this).index();
		$(this).addClass("on").siblings().removeClass("on");
		$("#menu ul").eq(index).addClass("current").siblings().removeClass("current");
		return false;
	});
	$("#menu ul li:not(.disable)").click(function()//侧边栏导航切换
		{
			$(this).children("dl").toggle().end().siblings().find("dl").hide();
			$(this).addClass("on").siblings().removeClass("on");
			return false;
		});
	$("#menu ul li:not(.disable) dl").click(function(e)
		{
			if(e.stopPropagation)
			{
				e.stopPropagation();
			}else
			{
				e.cancelBubble = false;
			}
			
		});
	$("#menu ul li:not(.disable) dl a").click(function(e)
		{
			if(e.preventDefault)
			{
				e.preventDefault();
			}else
			{
				e.returnValue = false;
			}
		});
	$("a.compose").click(function(){//compose编辑按钮style切换
		$(this).toggleClass("compose-on");
	});
	$(".feed-cont li:last").addClass("last");

});
		
