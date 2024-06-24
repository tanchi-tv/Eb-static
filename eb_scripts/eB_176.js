newInitClaimDialog = false
var panel = $('.datagrid-toolbar:first')
$('<a class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" btnid="toOffline" iconcls="icon-invoice" onclick="bindClaims()" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text">批量认领理赔款</span><span class="l-btn-icon icon-invoice"></span></span></a>').appendTo(panel)

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
			url: url,
			data: arrayParams[idx],
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

function bindClaims() {
    var selections = $('#datagrid').datagrid("getSelections");
    if(selections.length < 1){
        js.warning("请选择流水后进行操作");
        return false;
    }
    for (let i = 0; i < selections.length; i++) {
        if (!isActionableButton(selections[i])){
			cantActionableButtonMsg("绑定理赔款");
			return false;
		}
        if(selections[i].tradeType == 0 || selections[i].writeoffBalance == 0){
			js.alert("请选择未核销完毕的银行到款记录");
			return false;
		}
    }
    if(!newInitClaimDialog){
        newInitClaimDialog = true;
        var html = '';
        html += '<div id="bindClaimDlg" easyui="dialog" style="width:486px;height:226px;display:none" title="绑定理赔款" data-options="closed:true,buttons:' + "'#bindClaimButtons'" + ',modal:true">';
        //html += '<div class="alert alert-input" style="margin-bottom:8px;margin-left:10px;margin-top:10px;width: 525px;">';
        //html += '<span class="label" >';
        //html += '流水号：<strong id="label_claim_serial_no"></strong>';
        //html += '</span></div>';
        html += '<form id="bindClaimForm" method="POST" class="form" action="accountCurrent/writeOffAllToMembers">'
        html += '<ul><li><table><tbody><tr>';
        html += '<td id="bindClaimTypeButton">&nbsp;&nbsp;'
        html += '<lable class="inputLable">理赔类型:</lable>'
        html += '<input id="bindClaim_type1" type="radio" name="bindClaimType" value="124786">生育津贴</input>'
        html += '<input id="bindClaim_type2" type="radio" name="bindClaimType" value="124787">工伤理赔</input>'
        html += '<input id="bindClaim_type3" type="radio" name="bindClaimType" value="124781">商保理赔</input>'
        html += '</td></tr></tbody></table></li></ul>'
        html += '<input type="hidden" name="serialId" id="bindClaim_serialId"/>'
        html += '<input type="hidden" name="claimType" id="bindClaim_claimType"/>'
        html += '</form>'
        html += '<div id="bindClaimButtons">';
        html += '<a href="javascript:void(0)" class="easyui-linkbutton" data-options="iconCls:' + "'icon-save'" + '" onclick="confirmBindClaims();">确 定</a>';
        html += '</div></div>';
        $(html).dialog({title: '绑定理赔款'})
        
    }

    openWindow('#bindClaimDlg')
}

function confirmBindClaims() {
    var memberId = ''
    var type = $("input[name='bindClaimType']:checked").val()
    if (type == null || type == '' || type == undefined){
        js.warning("请选择绑定理赔款类型");
        return;
    }

    var selections = $('#datagrid').datagrid("getSelections");
    for (let i = 0; i < selections.length; i++) {
        if (!isActionableButton(selections[i])){
			cantActionableButtonMsg("绑定理赔款");
			return false;
		}
        if(selections[i].tradeType == 0 || selections[i].writeoffBalance == 0){
			js.alert("请选择未核销完毕的银行到款记录");
			return false;
		}
    }
    if (type == "124786") {
        memberId = "124786"
    }
    if (type == "124787") {
        memberId = "124787"
    }
    if (type == "124781") {
        memberId = "124781"
    }
    var arrayParams = []
    for (let i = 0; i < selections.length; i++) {
		var writeOffInfo = {
			memberId: memberId,
			writeOff: selections[i].writeoffBalance.toString(),
			array: []
		};
		writeOffInfo = JSON.stringify(writeOffInfo)
		//'masterMemberId=' + memberId +'&slaveMemberId=&diffFile=&serialNo=' + selections[i].serialNo + '&writeOffInfo=' + writeOffInfo + '&comment=认领理赔款'
        arrayParams.push({
			masterMemberId: memberId,
			slaveMemberId: '',
			diffFile: '',
			serialNo: selections[i].serialNo,
			writeOffInfo: writeOffInfo,
			comment: '认领理赔款'
		})
    }
    js.loading("数据正在提交处理中...");
    chainPost(basePath + '/accountCurrent/writeOffAllToMembers', arrayParams, undefined, function(){
        //完成后刷新表格 关闭窗口
        js.show("操作成功");
        //$("#batchAllowWriteoffForm_updateNote").textbox("clear");
        $('#bindClaimDlg').dialog('close');
        $("#datagrid").datagrid("reload");
        js.closeLoading();
    });
}

function isActionableButton(serial){
    if (serial == null || serial == undefined || serial == ''){
        return true;
    }
    if (serial.currentType == 2){
        return false;
    }
    return true;
}

function cantActionableButtonMsg(key){
    js.warning("派费直达流水不支持操作" + key + "!");
}

