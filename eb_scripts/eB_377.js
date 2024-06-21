$.fn.pasteFromTable = function(cb) {    
    $(this).bind('paste', function(e) {
        
        e.preventDefault(); //消除默认粘贴
        
        //获取粘贴板数据
        var clipboardData = window.clipboardData || e.originalEvent.clipboardData, // IE || chrome  
                data = clipboardData.getData('Text'),
                //判断表格数据是使用\n还是\r\n还是\r分行,解析成行数组
                rowArr = 
					(data.indexOf(String.fromCharCode(13) + String.fromCharCode(10)) > -1) ? 
                        data.split(String.fromCharCode(13) + String.fromCharCode(10)) : 
						(data.indexOf(String.fromCharCode(10)) > -1) ? 
						data.split(String.fromCharCode(10)) :
                        data.split(String.fromCharCode(13));
                    //根据\t解析单元格
                    cellArr = rowArr.filter(function(item) { //兼容Excel行末\n,防止粘贴出多余空行
                  return (item !== "")
              }).map(function(item) {
                  return item.split(String.fromCharCode(9));
              });

        //输出至网页表格
        var tab = $(e.target).parents('table')[0],  //表格
                td = $(e.target).parents('td'),    //当前单元格
                startRow = td.parents('tr')[0].rowIndex, //当前单元格行数 
                startCell = td[0].cellIndex, //当前单元格列数
                rows = tab.rows.length;  //总行数

        for (var i = 0; i < cellArr.length && startRow + i < rows; i++) {
            var cells = tab.rows[startRow + i].cells.length;  //该行总列数
            
            for(var j = 0; j < cellArr[i].length && startCell + j < cells; j++) {
                var cell = tab.rows[startRow + i].cells[startCell + j];
                $(cell).find(':input').val(cellArr[i][j]);
                if (cb) {cb(cell)};
            }
        }
    })
}

$(function(){
var transferBalanceForm = $('#transferBalanceForm')
$('#transferBalanceDlg > div').css({
	'margin-bottom':'8px',
	'margin-left':'10px',
	'margin-top':'10px',
	'width' : '744px'
})
$('#transferBalanceDlg').append($('<div id="div_transferBalanceForm" style="margin-bottom:8px;margin-left:10px;margin-top:10px;width: auto;">'))
transferBalanceForm.appendTo($('#div_transferBalanceForm'))
var transferBalanceButton2 = $('#transferBalanceButton2')
$('<input id="transferBalanceForm_type3" type="radio" name="transferBalanceType" value="3">批量余额转移</input>').appendTo(transferBalanceButton2)

var html = ''
html += '<tr>'
html += '<td id="transferBalanceButton3">'
html += '<label class="inputLabel" for="transferBalance_memberId2">选择会员+:</label>'
html += '<input type="hidden" id="transferBalance_memberId2" name="transferBalanceMemberId">'
html += '</td>'
html += '</tr><ul>'
$('#transferBalanceForm > table > tbody').append(html)

html = '<table id="table_slave_table" style="margin-bottom:8px;margin-left:10px;margin-top:10px;width: auto;">'
html += '<thead><tr><td>分配会员</td><td>分配自主金额(元)</td><td>分配监控金额(元)</td><td>操作</td></tr></thead>'
html += '<tbody id="slave_table" style="display: table-row-group;"></tbody></table>'
$('#div_transferBalanceForm').append(html)
$('#slave_table > tbody').prepend('	&nbsp;&nbsp;')
$('#transferBalanceButton3').prepend('	&nbsp;&nbsp;')

$('#transferBalanceDlg > div.alert.alert-warning').append($('<br>'))
html = ''
html += '<p>'
html += '自主账户预转金额剩余：<strong id="transferBalance_freeAmount" style="color: #b94a48"></strong> 元'
html += '监控账户预转金额剩余：<strong id="transferBalance_boundAmount" style="color: #b94a48"></strong> 元'
html += '</p>'
$('#transferBalanceDlg > div.alert.alert-warning').append(html)

// 是否初始化
var newInitDialog = false

if(!newInitDialog) {
	newInitDialog = true;
	var maxwin = getMaxDialogSize();
	var h = 550;
	var w = maxwin.width > 800 ? 800 : maxwin.width;
	$("#transferBalanceDlg").dialog({height: h, width: w});
	$("#transferBalanceButton3").hide();
	$("#slave_table").pasteFromTable();
	$("#table_slave_table").hide();
}

$("#transferBalance_memberId2").memberselectbox({singleSelect:false,btnText:"选择",
			plain : false,// 按钮简洁模式
			queryParams: {'checkStatus': 'success','serviceStatus':'1',"virtualFlag":'0'},
			callback:function(rows){
				var html = "";
				var slaveFlag = false;
				for (let i = 0; i < rows.length; i++) {
					if (isTransferToTmp(rows[i].memberCode)){
						slaveFlag = true;
						break
					}
					// 需要判断是否有已经选过的,选过的不在拼接html
					if ($("#slave" + rows[i].memberId).length > 0){
						continue;
					}
					html+= "<tr id='slave" +  rows[i].memberId + "'>";
					html+= '<td><span type="hidden" id="slaveMemberId">' + rows[i].memberName + '</span></td>';
					html+= '<td><input class="slaveDistribute" id="'+ rows[i].memberId +'"   name = "slaveDistributePrice" value="0.00" type="number"></td>';
					html+= '<td><input class="slaveDistribute" id="P'+ rows[i].memberId +'"   name = "slaveDistributeJKPrice" value="0.00" type="number"></td>';
					html+= '<td><a href="javascript:void(0)" class="easyui-linkbutton" onclick="delSlaveMember('+ rows[i].memberId + ')">删除</a></td>';
					html+= "</tr>";
				}
				if (slaveFlag){
					html = '';
					js.alert("不能选择待查款会员");
					return;
				}
				$("#slave_table").append(html);
			},
			onChange:function(data){
				$(".slaveDistribute").blur(function(res) {
					var elementsByName = document.getElementsByName("slaveDistributePrice");
					var elementsByName2 = document.getElementsByName("slaveDistributeJKPrice");

					var tempPrice_free = parseFloat($("#transferBalance_freeBalance").text());
					var tempPrice_bound = parseFloat($("#transferBalance_boundBalance").text());

					var slavePrice_free = 0;
					var slavePrice_bound = 0;

					for (let i = 0; i < elementsByName.length; i++) {
						// 先要判断是否为空,为空则设置为0.00
						if (elementsByName[i].value == null || elementsByName[i].value == ''){
							$("#"+elementsByName[i].id).val(parseFloat(0.00));
							continue
						}
						if (!isNumber(elementsByName[i].value)) {
							continue;
						}
						var value = parseFloat(elementsByName[i].value);
						if (value < 0){
							$("#"+elementsByName[i].id).val(parseFloat(0.00).toFixed(2));
							continue;
						}
						value = value.toFixed(2);
						$("#"+elementsByName[i].id).val(value);
						slavePrice_free = numAdd(slavePrice_free, value);
						if (slavePrice_free > tempPrice_free){
							$("#"+elementsByName[i].id).val(parseFloat(0.00).toFixed(2));
						}else {
							var price = numSub(tempPrice_free, slavePrice_free);
							$("#transferBalance_freeAmount").text(price);
						}
					}

					for (let i = 0; i < elementsByName2.length; i++) {
						// 先要判断是否为空,为空则设置为0.00
						if (elementsByName2[i].value == null || elementsByName2[i].value == ''){
							$("#"+elementsByName2[i].id).val(parseFloat(0.00));
							continue
						}
						if (!isNumber(elementsByName2[i].value)) {
							continue;
						}
						var value = parseFloat(elementsByName2[i].value);
						if (value < 0){
							$("#"+elementsByName2[i].id).val(parseFloat(0.00).toFixed(2));
							continue;
						}
						value = value.toFixed(2);
						$("#"+elementsByName2[i].id).val(value);
						slavePrice_bound = numAdd(slavePrice_bound, value);
						if (slavePrice_bound > tempPrice_bound){
							$("#"+elementsByName2[i].id).val(parseFloat(0.00).toFixed(2));
						}else {
							var price = numSub(tempPrice_bound, slavePrice_bound);
							$("#transferBalance_boundAmount").text(price);
						}
					}
				});
				$("#transferBalance_memberId2").memberselectbox("clear");
			}
		});

$("#transferBalanceForm_type3").change(function(){
	$("#transferBalanceButton").hide();
    $("#transferBalanceButton1").hide();
    $("#notCheck").hide();
    $("#transferBalanceButton3").show();
    $("#notCheck").hide();  
    $('li[for="transferBalanceForm_freeBack"]').hide()
    $('li[for="transferBalanceForm_boundBack"]').hide()
    //$('li[for="transferBalanceForm_cancelNote"]').hide()
	$("#table_slave_table").show()
    // 设置记账日期为当前日期
    $("#transferBalanceForm_billDate").textbox("setValue",dateFormat(new Date(),"yyyy-MM-dd"));

	$("#transferBalance_freeAmount").text($("#transferBalance_freeBalance").text());
	$("#transferBalance_boundAmount").text($("#transferBalance_boundBalance").text());
});

$("#transferBalanceForm_type1").change(function(){
	$("#transferBalanceButton1").show();
	$("#transferBalanceButton3").hide();
	$("#transferBalanceButton").show();
	$("#notCheck").hide();
	$('li[for="transferBalanceForm_freeBack"]').show()
    $('li[for="transferBalanceForm_boundBack"]').show()
    //$('li[for="transferBalanceForm_cancelNote"]').show()
	$("#table_slave_table").hide()
});
$("#transferBalanceForm_type2").change(function(){
	$("#transferBalanceButton1").hide();
	$("#transferBalanceButton3").hide();
	$("#transferBalanceButton").show();
	$("#notCheck").show();
	$('li[for="transferBalanceForm_freeBack"]').show()
    $('li[for="transferBalanceForm_boundBack"]').show()
    //$('li[for="transferBalanceForm_cancelNote"]').show()
	$("#table_slave_table").hide()
	// 设置记账日期为当前日期
	$("#transferBalanceForm_billDate").textbox("setValue",dateFormat(new Date(),"yyyy-MM-dd"));
});
})

// 防止异步执行一次性请求太多 实现一个简易链式Post
function chainPost(url, arrayParams, arrayBody, callback){
	var idx = 0;
	var total = arrayParams.length;
	var hook = function(){
		return idx + 1
	};
	var _error = []
	/* // 模拟请求
	var mockajax = function() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve('测试')
			}, 100)
		})
	}
	var _mock = function() {
		mockajax().then(function(data){
			idx += 1
				if (idx < total) {
					console.log(data + idx);
					console.log(url + arrayParams[idx])
					_mock()
				} else {
					$.messager.progressplus('close')
					console.log(_error)
					if (callback) {
						callback()
					}
				}
		});
	}
	_mock(); */
	var _ajax =  function() {
		$.ajax({
			type: 'POST',
			url: url + arrayParams[idx],
			success: function(data) {
				console.log('余额转移' + idx + '返回成功');
				console.log(url + arrayParams[idx])
				idx += 1
				if (idx < total) {
					_ajax()
				} else {
					$.messager.progressplus('close')
					console.log('余额转移错误列表：');
					console.log(_error)
					if (callback) {
						callback()
					}
				}
			},
			error: function() {
				_error.push(arrayParams[idx])
				idx += 1
				if (idx < total) {
					_ajax()
				} else {
					$.messager.progressplus('close')
					console.log('余额转移错误列表：');
					console.log(_error)
					if (callback) {
						callback()
					}
				}
			}
		})
	}
	_ajax();

	$.messager.progressplus({
		interval: 100,
		hook: hook,
		total: total
	});

}

// 一个可传hook的进度条
$.messager.progressplus = function (_2b9) {
	var _2ba = {
		bar: function () {
			return $("body>div.messager-window").find("div.messager-p-bar");
		}, close: function () {
			var dlg = $("body>div.messager-window>div.messager-body:has(div.messager-progress)");
			if (dlg.length) {
				dlg.dialog("close");
			}
		}
	};
	if (typeof _2b9 == "string") {
		var _2bb = _2ba[_2b9];
		return _2bb();
	}
	_2b9 = _2b9 || {};
	var opts = $.extend({}, {
		title: "",
		minHeight: 0,
		content: undefined,
		total: undefined,
		text: undefined,
		hook: undefined,
		interval: 300
	}, _2b9);
	var dlg = unpack_2b2($.extend({}, $.messager.defaults, {
		content: "<div class=\"messager-progress\"><div class=\"messager-p-msg\">" + '当前进度: 1/' + opts.total + "</div><div class=\"messager-p-bar\"></div></div>",
		closable: false,
		doSize: false
	}, opts, {
		onClose: function () {
			if (this.timer) {
				clearInterval(this.timer);
			}
			if (_2b9.onClose) {
				_2b9.onClose.call(this);
			} else {
				$.messager.defaults.onClose.call(this);
			}
		}
	}));
	var bar = dlg.find("div.messager-p-bar");
	bar.progressbar({text: opts.text});
	dlg.dialog("resize");
	if (opts.hook) {
		dlg[0].timer = setInterval(function () {
			var v = opts.hook();
			$("body>div.messager-window").find("div.messager-p-msg").html('当前进度: ' + v + '/' + opts.total)
			bar.progressbar("setValue", parseInt(v*100/opts.total));
		}, opts.interval);
	} else {
		$("body>div.messager-window").find("div.messager-p-msg").html('处理中...')
		dlg[0].timer = setInterval(function () {
			var v = bar.progressbar("getValue");
			v += 10;
			if (v > 100) {
				v = 0;
			}
			bar.progressbar("setValue", v);
		}, opts.interval);
	}
	return dlg;
}
// 这里改的比较多 核对每笔自主余额转移合计 与 监控余额转移合计是否小于该笔流水的各项
// 
function addSlaveMember(){
	var masterPrice_free = $("#transferBalance_freeBalance").text();//$("#masterDistributePrice").text();
	var masterPrice_bound = $("#transferBalance_boundBalance").text();

	if (masterPrice_free == null || masterPrice_free == '' || masterPrice_free == undefined || masterPrice_bound == null || masterPrice_bound == '' || masterPrice_bound == undefined){
		js.alert("自主账户或财务监控金额不能为空！");
		return false;
	}

	if (parseFloat(masterPrice_free) <= 0 && parseFloat(masterPrice_bound) <= 0){
		js.alert("未核销金额小于等于0,不能执行认领");
		return false;
	}

	var arrayMember = [];

	// 构建json数据
	// elementsByName.length应等于elementsByName2.length
	let elementsByName = document.getElementsByName("slaveDistributePrice");
	let elementsByName2 = document.getElementsByName("slaveDistributeJKPrice");
	if (elementsByName.length != elementsByName2.length) {
		js.alert("系统异常：elementsByName长度异常");
		return false;
	}
	
	if (elementsByName.length > 0){
		var slavePrice_free = 0;
		var slavePrice_bound = 0;
		for (let i = 0; i < elementsByName.length; i++) {
			var slaveJson = {
				'memberId': elementsByName[i].id,
				'writeOff': elementsByName[i].value,
				'PwriteOff': elementsByName2[i].value,
			}
			arrayMember.push(slaveJson);
			// 分配会员金额不能呢为空
			if (elementsByName[i].value == null || elementsByName[i].value == ''){
				js.alert("分配会员自主账户金额不能为空");
				return false;
			}
			if (elementsByName2[i].value == null || elementsByName2[i].value == ''){
				js.alert("分配会员监控账户金额不能为空");
				return false;
			}
			if (parseFloat(elementsByName[i].value) == 0 && parseFloat(elementsByName2[i].value) == 0){
				js.alert("分配会员自主账户和监控账户金额都不能为0");
				return false;
			}
			if (parseFloat(elementsByName[i].value) < 0 || parseFloat(elementsByName2[i].value) < 0){
				js.alert("分配会员自主账户和监控账户金额都小于0");
				return false;
			}
			slavePrice_free = numAdd(slavePrice_free,parseFloat(elementsByName[i].value));
			slavePrice_bound = numAdd(slavePrice_bound,parseFloat(elementsByName2[i].value));
		}
		// 检查分配会员金额不能大于流水自主账户分配金额
		if (parseFloat(slavePrice_free) > parseFloat(masterPrice_free)){
			js.alert("分配会员金额不能大于流水自主账户金额");
			return false;
		}
		if (parseFloat(slavePrice_bound) > parseFloat(masterPrice_bound)){
			js.alert("分配会员金额不能大于流水监控账户金额");
			return false;
		}
	}


	js.confirm("确认提交?",function(){
		//doSaveorUpdate('#distributePriceForm','#datagrid','#newCheckDlg');
		var transComment = '批量余额转移：' + $('li[for="transferBalanceForm_cancelNote"] > span > input').val()
		var incomeId = $('#transferBalanceForm > input[name=incomeId]').val()
		var arrayParams = []

		for (let i = 0; i < arrayMember.length; i++) {
			// 构造arrayParams
			arrayParams.push('freeBack=' + arrayMember[i].writeOff + '&boundBack=' + arrayMember[i].PwriteOff + '&memberId=' + arrayMember[i].memberId + '&incomeId=' + incomeId + '&cancelNote=' + transComment)
		}

		chainPost('https://boss.shebaotong.com/boss/memberIncomeRecord/balanceTransfer?', arrayParams, undefined, function(){
			//完成后刷新表格 关闭窗口
			$('#datagrid,#checkRecordDatagrid').datagrid("reload")
			$('#transferBalanceDlg').window("close")
		})
	});
}

function delSlaveMember(memberId){
    $("#slave" +memberId).remove();
    var elementsByName = document.getElementsByName("slaveDistributePrice");
	var elementsByName2 = document.getElementsByName("slaveDistributeJKPrice");

    var tempPrice_free = parseFloat($("#transferBalance_freeBalance").text());
	var tempPrice_bound = parseFloat($("#transferBalance_boundBalance").text());

    if (elementsByName.length == 0) {
        $("#transferBalance_freeAmount").text($("#transferBalance_freeBalance").text());
		$("#transferBalance_boundAmount").text($("#transferBalance_boundBalance").text());
        return
    }

    var slavePrice_free = 0;
	var slavePrice_bound = 0;
    for (let i = 0; i < elementsByName.length; i++) {
        if (!isNumber(elementsByName[i].value)) {
            continue;
        }
        var value = parseFloat(elementsByName[i].value);
        slavePrice_free = numAdd(slavePrice_free,value);
    }
	for (let i = 0; i < elementsByName2.length; i++) {
        if (!isNumber(elementsByName2[i].value)) {
            continue;
        }
        var value = parseFloat(elementsByName2[i].value);
        slavePrice_bound = numAdd(slavePrice_bound,value);
    }
    $("#transferBalance_freeAmount").text(numSub(tempPrice_free,slavePrice_free));
	$("#transferBalance_boundAmount").text(numSub(tempPrice_bound,slavePrice_bound));
}

// 是否待查款会晕
function isTransferToTmp(memberCode){
	if (memberCode == "50101"){
		return true;
	}
	return false;
}

// 执行余额转移
function doTransferBalance(){
var type = $("input[name='transferBalanceType']:checked").val()
if (type == null || type == '' || type == undefined){
	js.warning("请选择余额转移类型");
	return;
}

if (type == 1 || type == ''){
	var transferBalanceMemberId = $("#transferBalance_memberId").memberselectbox("getValue");
	if (transferBalanceMemberId == null || transferBalanceMemberId == '' || transferBalanceMemberId == undefined){
		js.warning("请选择余额转移的会员");
		return;
	}
	$("#transferBalanceForm input[name='memberId']").val(transferBalanceMemberId);
}else {
	$("#transferBalanceForm").attr("action", "memberIncomeRecord/changeNotWriteoff");
}

if (type == 3){
	addSlaveMember();
} else {
	doSaveorUpdate('#transferBalanceForm','#datagrid,#checkRecordDatagrid','#transferBalanceDlg');
}
}

// 是否数字
function isNumber(value) {
	var patrn = /^(-)?\d+(\.\d+)?$/;
	if (patrn.exec(value) == null || value == "") {
		return false
	} else {
		return true
	}
}

function unpack_2b2(_2b3) {
	unpack_2aa();
	var dlg = $("<div class=\"messager-body\"></div>").appendTo("body");
	dlg.dialog($.extend({}, _2b3, {
		noheader: (_2b3.title ? false : true), onClose: function () {
			unpack_2ae();
			if (_2b3.onClose) {
				_2b3.onClose.call(this);
			}
			setTimeout(function () {
				dlg.dialog("destroy");
			}, 100);
		}
	}));
	var win = dlg.dialog("dialog").addClass("messager-window");
	win.find(".dialog-button").addClass("messager-button").find("a:first").focus();
	return dlg;
};

function unpack_2aa() {
	$(document).unbind(".messager").bind("keydown.messager", function (e) {
		if (e.keyCode == 27) {
			$("body").children("div.messager-window").children("div.messager-body").each(function () {
				$(this).dialog("close");
			});
		} else {
			if (e.keyCode == 9) {
				var win = $("body").children("div.messager-window");
				if (!win.length) {
					return;
				}
				var _2ab = win.find(".messager-input,.messager-button .l-btn");
				for (var i = 0; i < _2ab.length; i++) {
					if ($(_2ab[i]).is(":focus")) {
						$(_2ab[i >= _2ab.length - 1 ? 0 : i + 1]).focus();
						return false;
					}
				}
			} else {
				if (e.keyCode == 13) {
					var _2ac = $(e.target).closest("input.messager-input");
					if (_2ac.length) {
						var dlg = _2ac.closest(".messager-body");
						unpack_2ad(dlg, _2ac.val());
					}
				}
			}
		}
	});
};

function unpack_2ad(dlg, _2b4) {
	dlg.dialog("close");
	dlg.dialog("options").fn(_2b4);
};

function unpack_2ae() {
	$(document).unbind(".messager");
};
