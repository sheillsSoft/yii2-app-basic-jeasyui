yii.app = (function ($) {
    var generateIdPrefix = 'w'
            , generateIdCounter = 0
            , ajaxDialogForm = {}
    , generateId = function () {
        var e, res;
        do {
            res = generateIdPrefix + generateIdCounter;
            e = document.getElementById(res);
            generateIdCounter++;
        } while (e);
        return res;
    }
    , maintab = {}
    , doIfReferenceExists = function (arrReference, callback, param) {
        var newArrReference = [], i = 1;
        $.each(arrReference, function (k, v) {
            if (i) {
                i = 0;
            } else {
                newArrReference.push(v);
            }
        });
        if (newArrReference.length) {
            yii.app.doIfReferenceExists(newArrReference, callback, param);
        } else {
            callback(param);
        }
    }
    , globalError = $('#global-error')
    ;

    return {
        isActive: false,
        westContent: '',
        northContent: '',
        centerContent: '',
        southContent: '',
        reference: {},
        getDialogForm: function (module, formName) {
            if (typeof ajaxDialogForm[module] !== 'undefined' && typeof ajaxDialogForm[module][formName] !== 'undefined') {
                return ajaxDialogForm[module][formName];
            } else {
                return $('#blank');
            }
        },
        init: function () {

            $.ajaxSetup({
                error: function (e) {
                    yii.app.showError(e);
                }
            });

            using(['accordion', 'layout', 'menu', 'menubutton', 'linkbutton', 'tabs', 'messager'], function () {

                $('body').layout({
                    fit: true,
                    border: !1
                }).layout('add', {
                    region: 'north',
                    content: yii.app.northContent,
                    height: 40
                }).layout('add', {
                    title: 'Navigation',
                    region: 'west',
                    iconCls: 'icon-compass',
                    split: !0,
                    width: 200,
                    content: yii.app.westContent
                }).layout('add', {
                    region: 'south',
                    content: yii.app.southContent
                }).layout('add', {
                    region: 'center',
                    content: yii.app.centerContent

                });

                delete yii.app.northContent;
                delete yii.app.westContent;
                delete yii.app.southContent;
                delete yii.app.centerContent;

                $('#north-user-menu-item').menu({
                }).menu('appendItem', {
                    text: 'Profile',
                    iconCls: 'icon-profile',
                    onclick: function (e) {
                        yii.app.createTab('Profile', yii.app.profileUrl, 'icon-profile', 'nav-profile');
                        e.stopPropagation();
                    }
                }).menu('appendItem', {
                    separator: !0
                }).menu('appendItem', {
                    text: 'Logout',
                    iconCls: 'icon-door-out',
                    onclick: function (e) {
                        yii.handleAction($('<a href="' + yii.app.logoutUrl + '" data-method="post"></a>'));
                        e.stopPropagation();
                    }
                });

                $('#north-user-menu').menubutton({
                    menu: '#north-user-menu-item'
                });

                var navigation = $('#navigation'),
                        navSelected;

                navigation.accordion({
                    border: !1,
                    fit: !0
                });

                $.each(yii.app.navItem, function (k, v) {
                    if (typeof v.visible === 'undefined' || v.visible) {
                        navigation.accordion('add', v);
                    }
                });

                $.each($('.nav-btn'), function (k, v) {
                    $(v).linkbutton({
                        toggle: !0,
                        group: 'g1',
                        iconCls: v.dataset.icon,
                        onClick: function () {
                            yii.app.createTab(v.dataset.tabtitle, v.dataset.url, v.dataset.icon, v.id);
                        }
                    });
                });

                maintab = $('#maintab');
                maintab.tabs({
                    fit: true,
                    border: !1,
                    onSelect: function (t, i) {
                        var tab = maintab.tabs('getTab', t),
                                options = tab.panel('options'),
                                nav = document.getElementById(options.data.nav);
                        window.history.pushState('', '', options.data.url);
                        document.title = t;
                        if (typeof nav !== 'undefined' && !nav.classList.contains('l-btn-selected')) {
                            navigation.find('.l-btn-selected').removeClass('l-btn-selected');
                            nav.classList.add('l-btn-selected');
                            navigation.accordion('select', nav.dataset.accordion);
                        }
                    }
                });

                if (typeof yii.app.tabOptions !== 'undefined') {
                    yii.app.createTab(yii.app.tabOptions.tabtitle, yii.app.tabOptions.url, yii.app.tabOptions.icon, yii.app.selectedNav);
                    delete yii.app.tabOptions;
                } else {
                    navSelected = document.getElementById(yii.app.selectedNav);
                    if (typeof navSelected !== 'undefined') {
                        yii.app.createTab(navSelected.dataset.tabtitle, navSelected.dataset.url, navSelected.dataset.icon, yii.app.selectedNav);
                    } else {
                        $.messager.alert('Error', 'Navigation not found', 'error');
                    }
                }

                delete yii.app.selectedNav;
                navSelected = null;

                if (typeof yii.app.errors !== 'undefined') {
                    $.messager.alert('Error', yii.app.errors, 'error');
                }
                delete yii.app.errors;
            });
        },
        createTab: function (title, url, icon, nav) {
            if (maintab.tabs('exists', title)) {
                maintab.tabs('select', title);
            } else {
                maintab.tabs('add', {
                    title: title,
                    href: url,
                    closable: true,
                    iconCls: icon,
                    data: {nav: nav, url: url}
                });
            }
        },
        showGridMsg: function (target, data) {
            var vc = $(target).datagrid('getPanel').children('div.datagrid-view');
            if (!data.rows.length) {
                var d = $('<div class="datagrid-empty"></div>').html('No Records Found').appendTo(vc);
                d.css({
                    position: 'absolute',
                    left: 0,
                    top: 50,
                    width: '100%',
                    textAlign: 'center'
                });
            } else {
                vc.children('div.datagrid-empty').remove();
            }
        },
        showError: function (e) {
            var content = typeof e.responseText !== 'undefined' ? e.responseText : e;
            if (typeof content === 'object') {
                var temp = [];
                $.each(content, function (k, v) {
                    temp.push(v);
                });
                content = temp.join(', ');
            }
            using('dialog', function () {
                globalError.dialog({
                    title: 'Error',
                    modal: true,
                    minWidth: 300,
                    minHeight: 200,
                    maxWidth: window.innerWidth - 50,
                    maxHeight: window.innerHeight - 50,
                    content: content
                });
            });
        },
        doIfReferenceExists: function (arrReference, callback, param) {
            if (typeof arrReference[0] !== 'undefined' && typeof yii.app.reference[arrReference[0]] === 'undefined') {
                $.ajax({
                    url: yii.app.getReferenceUrl,
                    data: {type: arrReference[0]},
                    dataType: 'json',
                    success: function (r) {
                        yii.app.reference[arrReference[0]] = r;
                        doIfReferenceExists(arrReference, callback, param);
                    }
                });
            } else {
                doIfReferenceExists(arrReference, callback, param);
            }
        },
        dateBoxFormatter: function (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();
            //return y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d);
            return (d < 10 ? ('0' + d) : d) + '-' + (m < 10 ? ('0' + m) : m) + '-' + y;
        },
        dateBoxParser: function (s) {
            if (!s)
                return new Date();
            var ss = (s.split('-'));
            var y = parseInt(ss[0], 10);
            var m = parseInt(ss[1], 10);
            var d = parseInt(ss[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return new Date(d, m - 1, y);
            } else {
                return new Date();
            }
        },
        //ini digunakan ketika onLoad di set di module pemanggil
        formOptionsOnCreateAjaxDialogForm: {},
        
        /**
         * @param string `module` nama module s
         * @param
         * @param
         * @param
         * @param
         * @return
         */
        createAjaxDialogForm: function (module, formName, options, formOptions, doBeforeOpen) {
            yii.app.formOptionsOnCreateAjaxDialogForm = formOptions;

            if (typeof ajaxDialogForm[module] === 'undefined') {
                ajaxDialogForm[module] = {};
            }

            if (typeof ajaxDialogForm[module][formName] === 'undefined') {
                var defaultOpt = {
                    title: formName,
                    closed: true,
                    modal: true,
                    width: 500,
                    height: 400,
                    buttons: [
                        {
                            iconCls: 'icon-disk',
                            text: 'Save',
                            handler: function () {
                            }
                        },
                        {
                            iconCls: 'icon-cancel',
                            text: 'Cancel',
                            handler: function () {
                                ajaxDialogForm[module][formName].dialog('close');
                            }
                        }
                    ],
                    onLoad: function (r) {
                        if (typeof formOptions !== 'undefined') {
                            if (typeof formOptions.loadData !== 'undefined') {
                                $('#' + $(r).attr('id')).form('load', formOptions.loadData);
                            }
                        }
                    }
                };

                options = $.extend(true, defaultOpt, options);

                if (window.innerHeight - 20 < options.height) {
                    options.height = window.innerHeight - 20;
                }
                using('dialog', function () {
                    ajaxDialogForm[module][formName] = $('<div></div>').dialog(options);
                    if (typeof doBeforeOpen !== 'undefined') {
                        doBeforeOpen();
                    }
                    ajaxDialogForm[module][formName].dialog('open');
                });
            } else {
                using('form', function () {
                    ajaxDialogForm[module][formName].children().form('clear');
                    if (typeof formOptions !== 'undefined') {
                        if (typeof formOptions.loadData !== 'undefined') {
                            ajaxDialogForm[module][formName].children().form('load', formOptions.loadData);
                        }
                    }
                    yii.refreshCsrfToken();
                });
                if (typeof doBeforeOpen !== 'undefined') {
                    doBeforeOpen();
                }
                ajaxDialogForm[module][formName].dialog('open');
            }
        },
        deleteHandler: function (dg, url, pk) {
            pk = pk || 'id';
            var idCheked = dg.datagrid('getChecked'),
                    data = {},
                    arrPk = pk || 'ids';
            if (idCheked.length) {
                data[arrPk] = [];

                $.each(idCheked, function (k, v) {
                    data[arrPk].push(v[pk]);
                });

                $.ajax({
                    url: url,
                    type: 'post',
                    dataType: 'json',
                    data: data,
                    success: function (r) {
                        dg.datagrid('reload');
                    }
                });
            } else {
                $.messager.alert('Attention', 'Must checked the record will be delete', 'warning');
            }
        },
        defaults: {
            validatebox: {
                minLength: function () {
                    using('validatebox', function () {
                        if (typeof $.fn.validatebox.defaults.rules.minLength === 'undefined') {
                            $.fn.validatebox.defaults.rules.minLength = {
                                validator: function (value, param) {
                                    return value.length >= param[0];
                                },
                                message: 'Please enter at least {0} characters.'
                            };
                        }
                    });
                },
                equals: function () {
                    using('validatebox', function () {
                        if (typeof $.fn.validatebox.defaults.rules.equals === 'undefined') {
                            $.fn.validatebox.defaults.rules.equals = {
                                validator: function (value, param) {
                                    return value == $(param[0]).val();
                                },
                                message: 'Field do not match.'
                            };
                        }
                    });
                }
            },
            pagination: {
                displayMsg: function (msg) {
                    msg = msg || '{from} - {to} of {total}';
                    using('pagination', function () {
                        $.fn.pagination.defaults.displayMsg = msg;
                    });
                }
            }
        }
    };
})(jQuery);