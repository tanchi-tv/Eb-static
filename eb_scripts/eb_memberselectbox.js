function openSelectMemberDlg(singleSelect,memberType, userMember,callBack, opener, param) {
	var queryParams = {};
	if (param) {
		$.each(param, function(name, value) {
			if (value != undefined && $.trim(value + "") != "") {
				queryParams[name] = value;
			}
		});
	}
	var src = basePath+"/memberInfo/toSelectMember?callBack=" // 选择会员页面的url
			+ callBack
			+ "&singleSelect="
			+ singleSelect
			+"&memberType="
			+memberType
			+"&userMember="
			+userMember
			+ (opener ? "&opener=" + opener : "")
			+ (queryParams ? "&queryParams="
					+ encodeURIComponent(JSON.stringify(queryParams)) : "");
	var dlg = $('div#selectMemberDlg');
	if (dlg.length == 0) {
		var dlgSize = getMaxDialogSize();
		var content = "<div id='selectMemberDlg' title='选择会员信息' class='easyui-dialog'"
				+ " style='width:"
				+ (dlgSize.width > 1366 ? 1366 : dlgSize.width)
				+ "px;height: "
				+ dlgSize.height
				+ "px;'"
				+ "closed='true' resizable='true'>"
				+ "<iframe id='selectMemberDlg_iframe' frameborder='0' scrolling='no' src='' height='100%' width='100%' onload='injectMemberDlg()'></iframe>"
				+ "</div>";
		$('body').append(content);
		dlg = $('div#selectMemberDlg');
		dlg.dialog();
		$("iframe", dlg).attr("src", src);
	} else {
		var iframe = $("iframe", dlg)[0].contentWindow;
		if (opener != iframe.opener)
			iframe.opener = opener;
		if (queryParams) {
			iframe.queryParams = queryParams;
			iframe.queryFormLoad(queryParams);
		}

		if (singleSelect != iframe.singleSelect || callBack != iframe.callBack) {// 改变了选择状态或者回调函数，重新刷新页面
			$("iframe", dlg).attr("src", src);
		} else {
			iframe.searchFun();
		}
	}
	dlg.dialog('open');
}

function injectMemberDlg() {
    var dlg = $('div#selectMemberDlg')
        ,iframe = $("iframe", dlg)[0].contentWindow;
    if ($("iframe", dlg).attr('src') != '') {
        iframe.eval('inject_cesv = window.parent.activateCESV.toString();eval(inject_cesv);activateCESV()')
    }
}