$(function(){
	function html_encode(str)   
	{   
	  var s = "";   
	  if (str.length == 0) return "";   
	  s = str.replace(/&/g, "&gt;");   
	  s = s.replace(/</g, "&lt;");   
	  s = s.replace(/>/g, "&gt;");   
	  s = s.replace(/ /g, "&nbsp;");   
	  s = s.replace(/\'/g, "&#39;");   
	  s = s.replace(/\"/g, "&quot;");   
	  s = s.replace(/\n/g, "<br>");   
	  return s;   
	} 
	$("#inbox-filter .inbox-f-item .top").on("click",function(){
		$(this).parents(".inbox-f-item").toggleClass("on");
	});
	$("#fn-add-keyword").on("click",function(){
		var val = $.trim($("#fn-input-text").val());
		if(val){
			val = html_encode(val);
			var tmpl = '<li class="keyword-item" style="opacity:0;"><span class="txt">'+val+'</span><span class="ui-icon ui-icon-delete"></span></li>';
			$(tmpl).appendTo("#fn-keywords").animate({opacity:1},300);;
			$("#fn-input-text").val("");
		}
	});
	$("#fn-keywords").on("click",".ui-icon-delete",function(){
		$(this).parent().animate({opacity:0},200,function(){
			$(this).remove();
		});
	});
	$("#fn-msg-list .panel .reply").on("click",function(){
		$(this).parents(".msg-item").addClass("on");
	});
	$("#fn-msg-list .detail").on("click",function(){
		$(this).parents(".msg-item").toggleClass("on");
	});
	$("#fn-msg-list .detail .panel").on("click",function(e){
		var e = e || window.event;
		if(e.stopPropagation){
			e.stopPropagation();
		}else{
			e.cancelBubble = true;
		}
	});
	$("#fn-msg-list .btns .ui-add-btn").on("click",function(){
		var txt = $.trim($(this).parent().prev(".ui-textarea").val());
		if(txt){
				txt = html_encode(txt);
			var picSrc = $(this).parent().prevAll(".c-avatar").attr("src");
				picSrc = picSrc ? picSrc : "./temp/pic_50x50.png";
			var uname = $(this).parents(".c-reply").attr("data-uname");
				uname = uname ? uname : "anonym";
			var tmpl = '<li class="c-item" style="opacity:0;background-color:#424242"><img src="'+picSrc+'" alt="xxx" class="c-avatar"><h3>'+uname+'</h3><p>'+txt+'</p></li>';
			$(tmpl).prependTo($(this).parents(".c-reply").prevAll(".c-list")).animate({opacity:1},200,function(){
				$(this).css({background:"#f0f0f0"});
			});
			$(this).parent().prev(".ui-textarea").val("");
			$(this).parents(".c-reply").prevAll(".c-list").animate({scrollTop:0},50);
		}
	});
	$("#fn-msg-list").on("click",".c-item .reply",function(){
		$(this).parents(".msg-item").addClass("on-mini");
	});
	$("#fn-msg-list .detail .reply").on("click",function(){
		$(this).parents(".msg-item").removeClass("on-mini");
	});
	//each data ready to server
	$("#fn-group").on("change",".con-list-item input",function(){
		var valObj = {"0":"2","1":"3","2":"0","3":"1"};
		var val = $.trim($(this).val());
		var newVal = valObj[val];
		$(this).val(newVal);
	});

	function rtnSaveData(){
			var itemString = []; // get itemString;
			var filterString = [];
			var keyword = [];
			function assembleObj(arr,args){
				var tmpObj = {};
				for(var i=0,l=args.length; i<l; i++)
				{
					tmpObj[args[i]] = arr[args[i].toLowerCase()];
				}
				return tmpObj;
			}
			$("#fn-group .con-list-item").each(function(){
				var obj = assembleObj($(this).data(),["Id"]);
				obj.Type = $.trim($(this).find("input").val());
				itemString[itemString.length] = obj;
			});

			$("#fn-filter-list .filter-i-item:not(.not-type-one)").each(function(){ //each fn-filter-list result
				if($(this).find("input").is(":checked")){
					var obj = assembleObj($(this).data(),["Id","FilterType"]);
					obj.IsChecked = $(this).find("input").is(':checked');
					filterString[filterString.length] = obj;
				}
			});

			$("#fn-keywords .keyword-item").each(function(){ //each keywords
				var obj = assembleObj($(this).data(),["Id","OwnKeywordId"]);
				obj.Word = $.trim($(this).children(".txt").text());
				keyword[keyword.length] = obj;
			});
			return {
			     "GroupItems": itemString,
			     "Filter": filterString,
			     "KeyWordItems": keyword
			}
		}
	$("#fn-save").click(function(){
		// console.log(rtnSaveData());
		$.post("form.php",rtnSaveData(),function(data){
			console.log(data);
		});
	});
});