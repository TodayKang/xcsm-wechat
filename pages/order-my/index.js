// pages/my-order/index.js

let config = require('../../utils/config.js');
let method = require('../../utils/method.js');
let moment = require("../../miniprogram_npm/moment/index.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        let statusEn = options.statusEn;

        let activeTab = 'all';
        let data = config.getPageFirst(null);
        if (!method.isNull(statusEn) && statusEn !== 'all') {
            activeTab = statusEn;
        }
        that.setData({
            activeTab: activeTab,
            data: config.getPageFirst(null),
            itemList: [],
        });

        that.loadPage();

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        let that = this;
        that.loadPage();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;
        let data = config.getPageNext(that.data.data);
        that.setData({
            data: data
        });

        that.loadOrderList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    bindscrolltolower: function () {
        this.onReachBottom();
    },

    searchChange: function (e) {
        let that = this;

        let keyWord = e.detail;
    },

    toOrderDetail: function (e) {
        let that = this;

        let orderDto = e.currentTarget.dataset.item;
        let orderId = orderDto['orderId'];
        wx.navigateTo({
            url: '/pages/order-detail/index?orderId=' + orderId
        });
    },

    tabOnChange: function (e) {
        let that = this;

        let activeTab = e.detail.name;
        that.setData({
            itemList: [],
            activeTab: activeTab,
            data: config.getPageFirst(null),
        });

        that.loadOrderList();
    },

    showHideOrderProduct: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let order = e.currentTarget.dataset.item;
        let itemList = that.data.itemList;
        for (let index in itemList) {
            if (itemList[index]['orderId'] === order['orderId']) {
                itemList[index]['showProductList_'] = (itemList[index]['showProductList_'] === true) ? false : true;
                order = itemList[index];
                break;
            }
        }

        if (order['showProductList_'] !== true) {
            that.setData({
                itemList: itemList
            });
            wx.hideLoading();
            return;
        }

        let promise = config.requestGet('/order-product/query/' + order['orderId']);
        promise.then(function (res) {
            let productList = res.data;
            for (let index in itemList) {
                if (itemList[index]['orderId'] === order['orderId']) {
                    itemList[index].productList = productList;
                    break;
                }
            }

            that.setData({
                itemList: itemList
            });
        }).catch(function (res) {

        }).finally(function (res) {
            wx.hideLoading();
        });

    },

    orderActionClick: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let action = e.currentTarget.dataset.action;
        let order_ = e.currentTarget.dataset.item;

        if (method.isNull(action) || method.isNull(order_)) {

        }

        let orderId = order_['orderId'];

        //第一次默认成功
        Promise.resolve().then(() => {
            //获取订单当前状态
            let promise = config.requestGet('/order/query/' + orderId);
            return promise;
        }).then(res => {
            //解析当前订单状态
            let order = res.data;
            if (order['statusEn'] !== order_['statusEn']) {
                wx.showModal({
                    title: '订单状态异常',
                    content: '当前订单编号[' + orderId + ']状态滞后，请下拉刷新后重试！',
                    showCancel: false
                });

                // 订单状态不一致，失败
                return Promise.reject();
            }

            // 解析跳转逻辑
            let data = {orderId: orderId};
            if (action === 'cancel' || action === 'delete' || action === 'pay' || action === 'refund') {
                // 取消订单，订单变为 交易关闭(hasClosed)
                if (action === 'cancel') {
                    data['statusEn'] = 'hasClosed';
                }

                //删除订单，订单变为 交易已删除(hasDelete 原则上不展示给用户)
                else if (action === 'delete') {
                    data['statusEn'] = 'hasDelete';
                    data['deleteFlag'] = 'Y';
                }

                //立即付款，订单变为 待发货(waitSend)
                else if (action === 'pay') {
                    data['statusEn'] = 'waitSend';
                }

                //申请退款，订单变为 已退款(hasRefund)
                else if (action === 'refund') {
                    data['statusEn'] = 'waitRefund';
                    data['refund'] = 'Y';
                }

                //当前是需要调用接口的
                let promise = config.requestPost('/order/update', data);
                return promise;
            }

            //其他操作返回失败，在 catch 处理
            return Promise.reject();
        }).then(res => {
            //再次调用接口获取处理后的订单状态
            let promise = config.requestGet('/order/query/' + orderId);
            return promise;
        }).catch(res => {
            //此时基本上不会发生异常
            return Promise.reject();
        }).then(res => {
            wx.hideLoading();
            //刷新当前订单最新的状态
            let itemList = that.data.itemList;
            for (let index in itemList) {
                if (itemList[index]['orderId'] === orderId) {
                    itemList[index] = res.data;
                    break;
                }
            }

            that.setData({
                itemList: itemList
            });

            wx.showToast({
                title: '操作成功',
                icon: 'success',
                mask: true,
            });
        }).catch(res => {
            wx.hideLoading();
            //再次购买，跳转到填单页
            if (action === 'buy') {
                //获取当前订单下单产品
                let promise = config.requestGet('/order-product/query/' + orderId);
                promise.then(function (res) {
                    let productList = res.data;
                    let buyInfo = {
                        productList: productList,
                    };

                    wx.setStorageSync('buyInfo', buyInfo);
                    wx.navigateTo({
                        url: '/pages/order-fill/index'
                    });
                });
            }

            //评价，跳转到评价页
            else if (action === 'rate') {
                data['orderStatus'] = 'waitSend';
            }
        });
    },

    loadPage: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let data = config.getPageFirst(null);
        let activeTab = that.data.activeTab;
        if (activeTab !== 'all') {
            data['statusEn'] = activeTab;
        }
        let promise1 = config.requestGet('/order-record/status');
        let promise2 = config.requestPost('/order/query', data);
        // let promise3 = config.requestPost('/order/size', data);

        Promise.all([promise1, promise2]).then(function (res) {
            let statusList = [{
                statusEn: 'all',
                statusZh: '全部'
            }];
            
            if (!method.isEmptyCollection(res[0].data)) {
                statusList = statusList.concat(res[0].data);
            }

            that.setData({
                data: data,
                itemList: res[1].data,
                activeTab: activeTab,
                statusList: statusList,
            });
        }).catch(function (res) {

        }).finally(function (res) {
            that.setData({
                loadReady: true,
            });
            wx.hideLoading();
        });
    },

    loadOrderList: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let data = that.data.data;
        if (that.data.activeTab !== 'all') {
            data['statusEn'] = that.data.activeTab;
        }
        let promise = config.requestPost('/order/query', data);
        promise.then(function (res) {
            if (!method.isEmptyCollection(res.data)) {
                let itemList = that.data.itemList;
                itemList = itemList.concat(res.data);

                that.setData({
                    itemList: itemList,
                });
            }
        }).catch(function (res) {

        }).finally(function () {
            wx.hideLoading();
        });
    },

})