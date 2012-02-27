var App = new Ext.application({
    name : 'KrisApp',
    useLoadMask : true,
    launch : function() {
    
        KrisApp.views = KrisApp.app.getViews();
        
        Ext.define('Expense', {
            config: {
                idProperty : 'expenseId',
                validations:[
                    {type:'presence', field:'expenseId'},
                    {type:'presence', field:'expenseItemName', message: 'Please enter the name for this expense'},
                    {type:'presence', field:'expenseItemPrice', message: 'Please enter the price for this expense'}
                ],
                fields : [
                    {name:'expenseId', type:'int'},
                    {name:'expenseItemName', type:'string'},
                    {name:'expenseItemPrice', type:'int'},
                    {name:'expenseItemDate', type:'date', dateFormat: 'c'},
                    {name:'expenseItemDescription', type:'string'}
                ]
            },
            extend: 'Ext.data.Model'
        });
        
        KrisApp.views.appExpenseEditorTopToolBar = Ext.create('Ext.Toolbar', {
            xtype: 'toolbar',
            id : 'appTopToolbar',
            title : 'Details',
            docked : 'top',
            layout : 'hbox',
            items : [
                {
                    id: 'backExpenseButton',
                    text: 'Home',
                    ui: 'back',
                    style: 'margin-top:7px;',
                    handler: function () {
                        KrisApp.views.viewport.setActiveItem(0, {type:'slide',direction:'right'});
                    }
                },
                { xtype: 'spacer' },
                {
                    id: 'saveExpenseButton',
                    text: 'Save',
                    ui: 'action',
                    style: 'height:30px;margin-top:7px;',
                    handler: function () {
                        var expenseEditor = KrisApp.views.appExpenseEditor;
                        var currentExpense = expenseEditor.getRecord();
                        var expenseList = KrisApp.views.expensesList;
                        var expensesStore = KrisApp.views.expensesStore;
                        
                        expenseEditor.updateRecord(currentExpense);
                        
                        var errors = currentExpense.validate();
                        if (!errors.isValid()){
                            currentExpense.reject();
                            Ext.Msg.alert('Wait!', 'One or more fields has not been entered!!', Ext.emptyFn);
                            return;
                        }
                        
                        if (expensesStore.findRecord('expenseId', currentExpense.data.expenseId) === null) {
                            expensesStore.add(currentExpense);
                        } else {
                            currentExpense.setDirty();
                        }
                        
                        expensesStore.sync();
                        expensesStore.sort([{property:'expenseItemDate',direction:'DESC'}]);
                        
                        expenseList.refresh();
                        
                        KrisApp.views.viewport.setActiveItem(0, {type:'slide',direction:'right'});
                    }
                }
            ]
        });
        
        KrisApp.views.appExpenseEditorBottomToolBar = Ext.create('Ext.Toolbar', {
            xtype: 'toolbar',
            id : 'appBottomToolbar',
            docked : 'bottom',
            layout : 'hbox',
            items : [
                { xtype: 'spacer' },
                {
                    id: 'trashExpenseButton',
                    iconCls: 'trash',
                    iconMask: true,
                    style: 'height: 38px; margin-top: 4px;',
                    handler: function () {
                        var currentExpense = KrisApp.views.appExpenseEditor.getRecord();
                        var expensesList = KrisApp.views.expensesList;
                        var expensesStore = KrisApp.views.expensesStore;
                        
                        if (expensesStore.findRecord('expenseId',currentExpense.data.expenseId)) {
                            expensesStore.remove(currentExpense);
                        }
                        
                        expensesStore.sync();
                        expensesList.refresh();
                        
                        KrisApp.views.viewport.setActiveItem(0, {type: 'slide', direction: 'right'});
                    }
                }
            ]
        });
        
        KrisApp.views.appExpenseEditor = Ext.create('Ext.form.FormPanel', {
            id: 'expenseEditor',
            items: [
                {
                    xtype: 'label',
                    html: 'Expense Name*:'
                },
                {
                    xtype:'textfield',
                    name:'expenseItemName',
                    style:'background-color: white; border-width: 1px;border-color: powderblue;border-style: solid;',
                    required: true
                },
                {
                    xtype: 'label',
                    html: '<br />'
                },
                {
                    xtype: 'label',
                    html: 'Expense Amount*:'
                },
                {
                    xtype:'textfield',
                    name:'expenseItemPrice',
                    style:'background-color: white; border-width: 1px;border-color: powderblue;border-style: solid;',
                    required: true
                },
                {
                    xtype: 'label',
                    html: '<br />'
                },
                {
                    xtype: 'label',
                    html: 'Expense Description:'
                },
                {
                    xtype:'textareafield',
                    name:'expenseItemDescription',
                    style:'background-color: white; border-width: 1px;border-color: powderblue;border-style: solid;'
                },
                KrisApp.views.appExpenseEditorTopToolBar,
                KrisApp.views.appExpenseEditorBottomToolBar
            ]
        });
        
        KrisApp.views.expensesStore = Ext.create('Ext.data.Store', {
                    model: 'Expense',
                    sorters: [{
                        property: 'expenseItemDate',
                        direction: 'DESC'
                    }],
                    proxy: {
                        type: 'localstorage',
                        id: 'expenseAppStore'
                    },
                    data: [
                        {expenseId: 1, expenseItemName: 'Test Item', expenseItemPrice: 28, expenseItemDate: new Date(), expenseItemDescription: 'This is just a test expense'}
                    ]
                });
        
        KrisApp.views.expensesList = Ext.create('Ext.List', {
                id:'expensesList',
                store : KrisApp.views.expensesStore,
                itemTpl:'<div class="list-item-title">{expenseItemName}<div style="float:right;font-size:70%;margin-right:60px;background-color:grey;color:white;font-weight:bold;">&nbsp Rs. {expenseItemPrice}&nbsp&nbsp</div></div>'+'<div class="list-item-narrative">{expenseItemDescription}</div>',
                onItemDisclosure:function(record){
                    var selectedExpense = record;
                    KrisApp.views.appExpenseEditor.load(selectedExpense);
                    KrisApp.views.viewport.setActiveItem(1, {type:'slide',direction:'left'});
                },
                listeners: {
                    'render': function(thisComponent) {
                        KrisApp.views.expensesStore.load();
                    }
                }
            });
        
        KrisApp.views.appListContainer = new Ext.Panel({
            id : 'appListContainer',
            layout : 'fit',
            html : 'This is the expenses list container',
            items : [{
                xtype: 'toolbar',
                id : 'appToolbar',
                title : 'Expenses',
                docked : 'top',
                layout : 'hbox',
                items : [
                    { xtype: 'spacer' },
                    {
                        id: 'newExpenseButton',
                        text: 'New',
                        ui: 'action',
                        style: 'height:30px;margin-top:7px',
                        handler: function () {
                            var now = new Date();
                            var expId = KrisApp.views.expensesList.getViewItems().length + 1;
                            var name = '';
                            var price = 0;
                            var desc = '';
                            
                            var expense = Ext.ModelMgr.create({
                                expenseId: expId, expenseItemName: name, expenseItemPrice: price,
                                expenseItemDate: now, expenseItemDescription: desc
                            }, 'Expense');
                            
                            KrisApp.views.appExpenseEditor.load(expense);
                            KrisApp.views.viewport.setActiveItem(1,
                                { type: 'slide', direction: 'left' });
                        }
                    }
                ]
            },
            KrisApp.views.expensesList]
        });
    
        KrisApp.views.viewport = new Ext.Panel({
            fullscreen : true,
            layout : 'card',
            cardAnimation : 'slide',
            items : [
                KrisApp.views.appListContainer,
                KrisApp.views.appExpenseEditor
            ]
        });
    }
});