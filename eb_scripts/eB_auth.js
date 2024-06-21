$.addExtendButton = function (){
    $.each($('.datagrid-f'), function (index, value) {
    var tabname = $(value).datagrid('options').viewName
    if (!tabname) {
        var panelIndex = $(value).parentsUntil('.easyui-tabs.tabs-container.easyui-fluid').slice(-2,-1).index()
        tabname = $(value).parentsUntil('.easyui-tabs.tabs-container.easyui-fluid').last().parent().find('.tabs-title').slice(panelIndex, panelIndex + 1).text()
    }
    switch (tabname) {
        case '发票管理-财务':
            var panel = $('#infoDatagrid_toolbar')
            $('<a class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" btnid="toOffline" iconcls="icon-invoice" onclick="toOffline()" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text">改为线下开票</span><span class="l-btn-icon icon-invoice"></span></span></a>').appendTo(panel)
            $('<a class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" btnid="toOnline" iconcls="icon-invoice" onclick="toOnline()" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text">改为线上开票</span><span class="l-btn-icon icon-invoice"></span></span></a>').appendTo(panel)
        
            break;
        case '到款认领':
            var panel = $('.datagrid-toolbar:first')
            $('<a class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" btnid="toOffline" iconcls="icon-invoice" onclick="checkMemberIncome()" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text">到款认领</span><span class="l-btn-icon icon-invoice"></span></span></a>').appendTo(panel)

            break;
        case '到款管理':
            var panel = $('.datagrid-toolbar:first')
            $('<a class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" btnid="toOffline" iconcls="icon-invoice" onclick="handCheckReceive()" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text">核销应收单</span><span class="l-btn-icon icon-invoice"></span></span></a>').appendTo(panel)
            break;
        case '申请内部开票':
            var panel = $('.datagrid-toolbar:first')
            $('<a class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" btnid="toOffline" iconcls="icon-invoice" onclick="applyInvoice()" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text">申请发票</span><span class="l-btn-icon icon-invoice"></span></span></a>').appendTo(panel)
            break;
        case '公司产品':
            var panel = $('.datagrid-toolbar:first')
            $('<a class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" btnid="toOffline" iconcls="icon-invoice" onclick="showInvoiceMakeMethodDialog()" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text">设置开票方式</span><span class="l-btn-icon icon-invoice"></span></span></a>').appendTo(panel)
            break;
        case '银行流水':
            var panel = $('.datagrid-toolbar:first')
            $('<a class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" btnid="toOffline" iconcls="icon-invoice" onclick="bindClaims()" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text">批量认领理赔款</span><span class="l-btn-icon icon-invoice"></span></span></a>').appendTo(panel)
            break;
        default:
            break;
    }
})

}

toOffline = function toOffline(){
    doBatch("#infoDatagrid", "/boss/invoiceInfo/toOffline", "invoiceId", true, "确定修改{count}张发票为线下开票吗？", function(r){
        if(r.makeMethod != "2"){
            js.alert("只能操作【线上开票】的发票！");
            return false;
        }
        return true;
    });
}

toOnline = function toOnline(){
    doBatch("#infoDatagrid", "/boss/invoiceInfo/toOnline", "invoiceId", true, "确定修改{count}张发票为线上开票吗？", function(r){
        if(r.makeMethod != "1"){
            js.alert("只能操作【线下开票】的发票！");
            return false;
        }
        return true;
    });
}

showInvoiceMakeMethodDialog = function() {
    $('#updateInvoiceMakeMethodDlg').dialog('open');
    setInvoiceMakeMethodPrids();
}

setInvoiceMakeMethodPrids = function (){
    var prids = [],
    selections = $('#datagrid').datagrid("getSelections");
    for (var i = 0; i < selections.length; i++) {
        prids.push(selections[i]['prId']);
    };
    $("#updateInvoiceMakeMethodFrom_prIds").val(prids.join(','))
}

$.addExtendButton();