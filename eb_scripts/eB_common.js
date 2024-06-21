js.warning('扩展功能激活成功!', function(){
    parent.callBackInjectState('success')
});

function activateCESV() {
    $.each($('.datagrid-f'), function (index, value) {
		var options = $(value).datagrid('options');
		// 添加导出按钮
		if (!options.toolbar) {
			options.toolbar = []
			options.toolbar.push({
				'id': 'export',
				'text': '导出',
				'iconCls': 'icon-export',
				'handler': function() {
					$(value).datagrid('showExpPanel')
				} 
			})
		} else {
			if (typeof options.toolbar == 'array') {
				for (var i = 0; i < options.toolbar.length; i++) {
					if (options.toolbar[i].text == '导出') {
						break;
					}
					if (i == options.toolbar.length - 1) {
						options.toolbar.push({
							'id': 'export',
							'text': '导出',
							'iconCls': 'icon-export',
							'handler': function() {
								$(value).datagrid('showExpPanel')
							} 
						})
					}
				}
			}
		}
		if (index == 0){
			addMultiRelateItem($(value), '内部应收单', {
				'receiveId': [
					'#feeDatagrid', 
					"#memberFeeDatagrid", 
					"#subjectDatagrid",
					"#deductionDatagrid"
				],
				'receiveNo': ["#checkDatagrid"],
				'invoiceApplyNo' : [
					{name:'applyNo',formid:'#invoiceDatagrid'}
				]
			});
			addMultiRelateItem($(value), '应收单管理', {
				'receiveId': [
					'#feeDatagrid', 
					"#subjectDatagrid", 
					"#receivableOrderDatagrid",
					"#deductionDatagrid",
					"#invoiceApplyDatagrid"
				],
				'receiveNo': ["#checkDatagrid"],
				'invoiceApplyNo' : [
					{name:'applyNo',formid:'#invoiceDatagrid'}
				]
			});
			addMultiRelateItem($(value), '应付单管理', {
				'payableId': [
					'#feeDatagrid', 
					"#paymentDatagrid",
					"#invoiceDatagrid", 
					"#checkDatagrid",
					"#deductionDatagrid",
					"#rechargeDatagrid",
					"#transferBillDatagrid"
				]
			});
			addMultiRelateItem($(value), '分公司代付', {
				'payableId': [
					'#feeDatagrid'
				]
			});
			addMultiRelateItem($(value), '供应商信息', {
				'supplierId': [
					'#contractDatagrid'
				]
			});

			if (Array.isArray(options.toolbar)) {
			options.toolbar.push({
				'id': 'multirelatesearch',
				'text': '联查明细',
				'iconCls': 'icon-detail',
				'handler': function() {
					var multisettings = $('.datagrid-f:first').datagrid('options').multisettings[$('.datagrid-f:first').datagrid('options').viewName]
					if (multisettings) {
						var data = $('.datagrid-f:first').datagrid('getSelections');
						if (data.length == 0) {
							$.messager.alert("系统提示", '至少需要选择一行', 'warning', undefined);
							return false
						}
						Object.keys(multisettings).forEach(
							function(val, idx, array) {
								var param = '@';
								for (var i = 0; i < data.length; i++) {
									param = param + data[i][val] + ' ';
								}
								$.each(multisettings[val], function (i, o) {
									if (typeof o == 'string') {
										$(o).datagrid('reload', {
											[val]: param
										});
									} else {
										var obj = {
											[o.name]: param
										}
										if (o.tableName) {
											$.extend(obj, {
												tableName: typeof o.tableName == 'string' ? o.tableName : o.tableName()
											})
										}
										$(o.formid).datagrid('reload', obj);
									}
								})
							}
						)
					} else {
						$.messager.alert("系统提示", $('.datagrid-f:first').datagrid('options').viewName + '暂不支持联查', 'warning', undefined);
						return false;
					}
				}
			});
		}
	}

		// 自定义标题
		if (!options.viewName) {
			// 获取tab名称并复制给viewName
			var panelIndex = $(value).parentsUntil('.easyui-tabs.tabs-container.easyui-fluid').slice(-2,-1).index()
			options.viewName = $(value).parentsUntil('.easyui-tabs.tabs-container.easyui-fluid').last().parent().find('.tabs-title').slice(panelIndex, panelIndex + 1).text()
		}

		// 添加分页栏
		options.pagination = true;
		options.pageList = [
			1,
			10,
			30,
			50,
			100,
			500,
			1000,
			2000,
			5000,
			10000,
			20000,
			30000
		];
		options.pageSize = 1000;

		// 激活多选
		options.singleSelect = false;
		// 扩展多选统计功能
		var ori_func = options.onSelect
		options.onSelect = function (index, param) {
			ori_func(index, param);
			onSelect(this);
		}.bind(value)

		$(value).datagrid();

	$.data(value, "datagrid").options.loader = function (_7ff, _800, _801) {
		var opts = $(this).datagrid("options");
	var alldata = {};
	var allurl = [];
	var alltotal = 0;
		if (!opts.url) {
			return false;
		}
	Object.keys(_7ff).forEach(function(val, idx, array) {
		var o = _7ff[val]
		if (allurl.length == 0 && o[0] == "@") {
			$.data(value, "datagrid").options.multi_query_field = val
			//multi_query_field = val
			splitparam = o.split(" ");
			splitparam[0] = splitparam[0].slice(1, splitparam[0].length)
			_7ff[val] = splitparam[0];
			splitparam.forEach(function(v,i,arr) {
				if (v != "") {
				var n_arr = {};
				n_arr = $.extend(n_arr, _7ff);
				n_arr[val] = v;
				allurl.push(n_arr);
				};
			})
		};
		});
	console.log(allurl);
	if (allurl.length <= 1) {
		$.ajax({
			type: opts.method, url: opts.url, data: _7ff, dataType: "json", success: function (data) {
				_800(data);
			}, error: function () {
				_801.apply(this, arguments);
			}
		});
	} else {
		var alert_msg = '';
		allurl.forEach(function(v,idx,array){
			if (idx == 0){
				$.ajax({
					type: opts.method, url: opts.url, data: v, dataType: "json", async: false, success: function (data) {
						$(value).datagrid("loading");
						alldata = data;
						alltotal = data.total
						if (data.total > 2000) {
							alert_msg = v[$.data(value, "datagrid").options.multi_query_field] + ' '
						}
						;
					}, error: function () {
						_801.apply(this, arguments);
					}
				});
			};
			if (idx > 0 && idx < array.length - 1) {
				$.ajax({
					type: opts.method, url: opts.url, data: v, dataType: "json", async: false, success: function (data) {
						alldata.rows.push(...data.rows);
						alltotal = alltotal + data.total
						if (data.total > 2000) {
							alert_msg = alert_msg + v[$.data(value, "datagrid").options.multi_query_field] + ' ';
						};
					}, error: function () {
						_801.apply(this, arguments);
					}
				});
			};
			if (idx == array.length - 1) {
				$.ajax({
					type: opts.method, url: opts.url, data: v, dataType: "json", success: function (data) {
						alldata.rows.push(...data.rows);
						alltotal = alltotal + data.total
						alldata.total = alltotal
						if (data.total > 2000) {
							alert_msg = alert_msg + v[$.data(value, "datagrid").options.multi_query_field] + ' ';
						};
						console.log(alldata);
						_800(alldata);
						if (alert_msg != '') {
							alert_msg = alert_msg + '查询的数据量过大无法显示';
							$.messager.alert("系统提示", alert_msg, 'warning', undefined);
						};
					}, error: function () {
						_801.apply(this, arguments);
					}
				});
			};
			})
		};
	};

	function addMultiRelateItem (jq, view, params) {
		if (!jq.datagrid('options').multisettings) {
			var settings = {};
			$.extend(settings, {
				[view]: params
			});
			jq.datagrid('options').multisettings = settings;
		} else {
			$.extend(jq.datagrid('options').multisettings, {
				[view]: params
			});
		}
		var multisettings = $('.datagrid-f:first').datagrid('options').multisettings[$('.datagrid-f:first').datagrid('options').viewName]
		if (multisettings && $('.datagrid-f:first').datagrid('options').viewName == view) {
			Object.keys(params).forEach(
				function(val, idx, array) {
					// 检查checkbox field冲突
					$('.datagrid-f:first').datagrid('options').frozenColumns[0].forEach(({field}, id) => {
						if (field == val) {
							$('.datagrid-f:first').datagrid('options').frozenColumns[0][id].field = 'ck';
						}
					});
					
					// 如果明细表单额外字段不存在于主表columns中 添加至主表columns
					var fields_existed = false
					$('.datagrid-f:first').datagrid('options').columns[0].forEach(({field}, id) => {
						if (field == val) {
							fields_existed = true;
						}
					});
					if (!fields_existed) {
						$('.datagrid-f:first').datagrid('options').columns[0].unshift({
							"meta": $('.datagrid-f:first').datagrid('options').columns[0][0].meta,
							"sortable": true,
							"width": 100,
							"field": val,
							"title": val,
							"boxWidth": 91,
							"deltaWidth": 9,
							"cellClass": "datagrid-cell-c13-" + val
						});
					}
					// 添加明细表额外字段
					$.each(params[val], function (i, o) {
						var options
						if (typeof o == 'string') {
							options = $(o).datagrid('options');
						} else {
							options = $(o.formid).datagrid('options');
						}
						// 检查checkbox field冲突
						if (options.frozenColumns[0]) {
						options.frozenColumns[0].forEach(({field}, id) => {
							if (field == val) {
								options.frozenColumns[0][id].field = 'ck';
							}
						});
					}
						options.columns[0].unshift({
							"meta": options.columns[0][0].meta,
							"sortable": true,
							"width": 100,
							"field": val,
							"title": val,
							"boxWidth": 91,
							"deltaWidth": 9,
							"cellClass": "datagrid-cell-c13-" + val
						});
					})
				}
			)
		}
	}

	function onSelect (jq, param) {
		var opts = $(jq).datagrid('options');
		if (!opts.showFooter)
			return;
	
		var codeField = "_statisticsCode";// 统计类型
		var rows = $(jq).datagrid("getSelections");
		if (rows.length < 2) {
			if (opts.subStats) {
				rows = $(jq).datagrid("getRows");
				opts.subStats = false;
			} else {
				return;
			}
		} else {
			opts.subStats = true;
		}

		var footerObj = $(jq).datagrid("getFooterRows");
		if (!param) {// 全部重新计算
			footerObj = new Array();
			var footer = new Array();
			footer['sum'] = "";
			footer['avg'] = "";
			footer['max'] = "";
			footer['min'] = "";
			// 计算冻结列
			statisticsCols(opts.frozenColumns);
			// 计算一般列
			statisticsCols(opts.columns);
	
			var labelField = getLabelField();
			convertData("sum", $.fn.datagrid.statistics.label["sum"]);
			convertData("avg", $.fn.datagrid.statistics.label["avg"]);
			convertData("max", $.fn.datagrid.statistics.label["max"]);
			convertData("min", $.fn.datagrid.statistics.label["min"]);
		} else {// 计算某一列某一项
			var footerRow = null;
			var index = 0;
			for (var i = 0; i < footerObj.length; i++) {
				if (footerObj[i][codeField] == param.code) {
					footerRow = footerObj[i];
					index = i;
					break;
				}
			}
			if (footerRow == null) {
				footerRow = {};
				footerRow[codeField] = param.code;
				footerRow[getLabelField()] = $.fn.datagrid.statistics.label[param.code];
				footerObj.push(footerRow);
			}
			var labelText = $.fn.datagrid.statistics.label[param.code];
			var textHtml = footerRow[param.field];
			var text = (footerRow[param.field]
					? footerRow[param.field]
					: "" + "").clear();
			if (text && text != labelText) {// 已有值
				if (text.indexOf(labelText) != -1) {
					footerRow[param.field] = $.fn.datagrid.statistics.label[param.code];
				} else {
					footerRow[param.field] = "";
				}
				var i = 0;
				$.each(footerRow, function(n, v) {
							if (v && n != codeField
									&& (v + "").clear() != labelText)
								i++;
						});
				if (i == 0) {
					footerObj.splice(index, 1);
				}
			} else {// 计算
				var prev = "";
				if (text == labelText)
					prev = textHtml;
				var value = 0;
				switch (param.code) {
					case "sum" :
						value = sum(param.field);
						break;
					case "avg" :
						value = avg(param.field);
						break;
					case "max" :
						value = max(param.field);
						break;
					case "min" :
						value = min(param.field);
						break;
				}
				footerRow[param.field] = prev + value;
			}
		}
		$(jq).datagrid('reloadFooter', footerObj);
	
		function convertData(code, label) {
			if (footer[code].length) {
				var tmp = '{'
						+ footer[code]
								.substring(0, footer[code].length - 1)
						+ "}";
				var obj = eval('(' + tmp + ')');
				obj[labelField] = label + (obj[labelField] ? obj[labelField] : "");
				obj[codeField] = code;
				footerObj.push(obj);
			}
		};
	
		function statisticsCols(columns) {
			if (!columns.length)
				return;
			for (var i = 0; i < columns.length; i++) {
				for (var j = 0; j < columns[i].length; j++) {
					var stat = columns[i][j].statistics;
					var field = columns[i][j].field;
					if (!stat)
						stat = {};
					if (stat.sum) {
						footer['sum'] += '"' + field + '":"' + sum(field)
								+ '",';
					}
					if (stat.avg) {
						footer['avg'] += '"' + field + '":"' + avg(field)
								+ '",';
					}
					if (stat.max) {
						footer['max'] += '"' + field + '":"' + max(field)
								+ '",';
					}
					if (stat.min) {
						footer['min'] += '"' + field + '":"' + min(field)
								+ '",';
					}
				}
			}
		};
		function getLabelField() {
			var labelf = "";
	
			if (opts.frozenColumns.length) {
				for (var i = 0; i < opts.frozenColumns.length; i++) {
					for (var j = 0; j < opts.frozenColumns[i].length; j++) {
						var f = opts.frozenColumns[i][j];
						if (!f.checkbox && f.title) {
							labelf = f.field;
							break;
						}
					}
					if (labelf != "")
						break;
				}
			}
			if (labelf == "") {
				if (opts.columns.length) {
					for (var i = 0; i < opts.columns.length; i++) {
						for (var j = 0; j < opts.columns[i].length; j++) {
							var f = opts.columns[i][j];
							if (!f.checkbox && f.title) {
								labelf = f.field;
								break;
							}
						}
						if (labelf != "")
							break;
					}
				}
			}
			return labelf;
		}
		function sum(filed) {
			var sumNum = 0;
			var pct = false;// 百分比数据
			var maxPrecision = 0;// 精度
			for (var i = 0; i < rows.length; i++) {
				var val = rows[i][filed];
				pct = isPercent(val);
				val = toNumber(val, pct);
				maxPrecision = getMaxPrecision(val, maxPrecision);
				sumNum += val;
			}
			return sumNum.toFixed(maxPrecision) + (pct ? "%" : "");
		};
		function avg(filed) {
			var sumNum = 0;
			var pct = false;
			var maxPrecision = 0;// 精度
			for (var i = 0; i < rows.length; i++) {
				var val = rows[i][filed];
				pct = isPercent(val);
				val = toNumber(val, pct);
				maxPrecision = getMaxPrecision(val, maxPrecision);
				sumNum += val;
			}
			return (sumNum / rows.length).toFixed(maxPrecision)
					+ (pct ? "%" : "");
		}
		function max(filed) {
			var max = 0;
			var pct = false;
			for (var i = 0; i < rows.length; i++) {
				var val = rows[i][filed];
				pct = isPercent(val);
				val = toNumber(val, pct);
				if (i == 0) {
					max = val;
				} else {
					max = Math.max(max, val);
				}
			}
			return max + (pct ? "%" : "");
		}
		function min(filed) {
			var min = 0;
			var pct = false;
			for (var i = 0; i < rows.length; i++) {
				var val = rows[i][filed];
				pct = isPercent(val);
				val = toNumber(val, pct);
				if (i == 0) {
					min = val;
				} else {
					min = Math.min(min, val);
				}
			}
			return min + (pct ? "%" : "");
		}
		function getMaxPrecision(val, oldPrecision) {// 获得最大精度
			var v = val + "";
			var n = 0;
			if (v.indexOf(".") != -1)
				n = v.length - v.indexOf(".") - 1;
			return n > oldPrecision ? n : oldPrecision;
		}
		function isPercent(val) {// 是否是百分比
			return typeof val == "string" && val.indexOf("%") != -1;
		}
		function toNumber(val, pct) {
			if (pct) {// 处理百分比
				val = Number(val.replace("%", ""));
			}
			return Number(isNaN(val) ? 0 : val);
		}
	}
})
doSearch = function (searchForm, datagrid) {
    if ($(searchForm).form("validate")) {
        // datagrid 可以加载数据
        $(datagrid).each(
            function () {
                $(this).datagrid("options").enableLoadData = true;
            }
        );
        var fields = $(searchForm).serializeArray();
		var existsbox = []
        var ckb = $(searchForm).find(":checkbox").length || $(searchForm).find(":radio").length;// 查询条件有checkbox
        var params = {};
        if (!ckb) {
            params = $(datagrid).datagrid("options").queryParams;
        }
        $.each(fields, function (i, field) {
            var name = field.name;
			existsbox.push(name)
            var value = field.value;
            if (value != "") {
                params[name] = value;
            } else {
                delete params[name];
            }
        });

		// 添加查询字段至表单和datagrid
		var options = $(datagrid).datagrid('options', undefined);
		var unexistColumn = [];
		Object.keys(params).forEach(function(val, idx, array) {
			for (var i = 0; i < options.columns[0].length; i++) {
				if (options.columns[0][i].field == val) {
					break;
				}
				if (i == options.columns[0].length - 1) {
					unexistColumn.push(val)
				}
			};
		});
		unexistColumn = unexistColumn.filter(
			val => {
				if (!existsbox.some(val2 => val2 == val)) {
					return val
				}
			}
		);

		for (var i = 0; i < unexistColumn.length; i++) {
			var boxlist = $(searchForm).find('ul:last');

			var box = $('<li></li>');
			$('<label></label>').addClass('inputLable').text(unexistColumn[i]).appendTo(box);
			$('<input>').prop('type', 'text').addClass('easyui-textbox textbox-f').css('width','120px')
				.prop('textboxname',unexistColumn[i]).appendTo(box);
			box.appendTo(boxlist);

			$(box).children().last().textbox({
				'label': unexistColumn[i],
				'labelPosition': 'before',
				'prompt': '额外的查询项',
				'type': 'text'
				
			});

			$(searchForm).find('input:last').prop('name', unexistColumn[i]);

			options.columns[0].unshift({
				"meta": options.columns[0][0].meta,
				"sortable": true,
				"width": 100,
				"field": unexistColumn[i],
				"title": unexistColumn[i],
				"boxWidth": 91,
				"deltaWidth": 9,
				"cellClass": "datagrid-cell-c13-" + unexistColumn[i]
			});
		}

		// 将增加的字段单独存放
		if (unexistColumn.length > 0) {
			options.unexistColumn = unexistColumn;
			$(datagrid).datagrid();
		}
		

        $(datagrid).datagrid("load", params);
    }
}

executeExp = function (exportData, callback, expTitle, datagrid) {
    var expTotal = 0;
    if (!$.isArray(exportData)) {
        if (!exportData.total)
            exportData.total = 0;
        if (!exportData.pageSize)
            exportData.pageSize = 10000;
        if (!expTitle && exportData.title)
            expTitle = exportData.title;
        if (exportData.total)
            expTotal = exportData.total
        if (exportData.meta)// 设置了全局meta
            setMeta(exportData.meta, exportData.thead);
		
		// 抽样统计单项row长度
		if (exportData.rows.length != 0) {
		var MAX_BODY_LENTH = 750000
		var SLICE_MAX_LEN = 200

		var data_len = exportData.rows.length - 1;
		var slice_idx = Math.trunc(data_len/SLICE_MAX_LEN) + 1;
		var tslice_lenth = 0;
		for (var i = 0; i < slice_idx; i++) {
			tslice_lenth = JSON.stringify(exportData.rows[i*SLICE_MAX_LEN]).length + tslice_lenth;
		};

		var ava_slice_length = Math.trunc(tslice_lenth/(slice_idx > 1 ? slice_idx-1 : slice_idx));
		
		if (ava_slice_length * exportData.rows.length > MAX_BODY_LENTH) {
			var post_count = Math.ceil((ava_slice_length * exportData.rows.length) / MAX_BODY_LENTH);
			var post_rows = Math.ceil(exportData.rows.length / post_count) // 单个请求总行数
			var multi_download = true
			var root$ = rootWin().$
			// 提示分割数
				var confirmMsg = "预估将分割为" + post_count + "个文件下载，确定继续吗"
				root$.messager.confirm("系统提示", confirmMsg, function (r) {
					if (r) {
						dosubmit();
					}
				});
		}
	};

    } else {// 数组，导出多个sheet页
        for (var i = 0; i < exportData.length; i++) {
            var data = exportData[i];
            if (!expTitle && data.title)
                expTitle = data.title;
            if (data.total)
                expTotal += data.total;
            if (data.meta)// 设置了全局meta
                setMeta(data.meta, data.thead);
        }
    };

	if (!multi_download) {
    expTitle = expTitle ? expTitle : "数据导出";

    var root$ = rootWin().$;
    root$.messager.progress({
        title : "",
        msg : expTitle + "--数据正在导出",
        interval : expTotal / 10 < 100 ? 100 : expTotal / 10
    });
    // 提交后台生成导出文件
    root$.post(basePath + "/datagridExport", "data="
        + encodeURIComponent(JSON.stringify(exportData))+"&filename="+expTitle, function(data) {
        if (callback) {
            callback.call();
        }
        root$.messager.progress('close');
        var title = expTitle;
        if (data.success) {// 导出成功
            if (data.files.length == 1) {// 单个文件直接下载
                dowloadExportFile(data.files[0], title);
            } else if (data.files.length > 1) {// 导出多个文件
                openMultFilePanel(data, title);
            }
        } else {// 失败
            openExpFailedPanel(exportData.pageSize, datagrid);
        }
    }, "json");

	}

    // 为thead设置meta
    function setMeta(meta, thead) {
        for (var i = 0; i < thead.length; i++) {
            var column = thead[i];
            if (!column.meta) {
                column.meta = meta;
            }
        }
    }

	function dosubmit() {
		var ori_title = expTitle
		for (var i = 0; i < post_count; i++) {
			var exportDataSlice = $.extend({},exportData)
			var last_idx = (i+1)*post_rows < exportData.rows.length ? (i+1)*post_rows: exportData.rows.length
			exportDataSlice.rows = exportDataSlice.rows.slice(i*post_rows, last_idx)
			exportDataSlice.total = exportDataSlice.rows.length
			expTitle = ori_title ? ori_title + '_' + i*post_rows + "to" + last_idx : "数据导出" + '_' + i*post_rows + "to" + last_idx

			if (i == 0) {
				root$.messager.progress({
					title : "",
					msg : "数据正在导出",
					interval : expTotal / 10 < 100 ? 100 : expTotal / 10
				});
			}

			// 提交后台生成导出文件
			root$.post(basePath + "/datagridExport", "data="
			+ encodeURIComponent(JSON.stringify(exportDataSlice))+"&filename="+expTitle, function(data) {
			if (callback) {
				callback.call();
			}
			root$.messager.progress('close');
			var title = expTitle;
			if (data.success) {// 导出成功
				if (data.files.length == 1) {// 单个文件直接下载
					dowloadExportFile(data.files[0], title);
				} else if (data.files.length > 1) {// 导出多个文件
					openMultFilePanel(data, title);
				}
			} else {// 失败
				openExpFailedPanel(exportData.pageSize, datagrid);
			}
		}, "json");

		}
	}
}


}