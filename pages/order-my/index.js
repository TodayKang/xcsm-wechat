// pages/my-order/index.js

let method = require('../../utils/method.js');
let util = require('../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        let statusEn = options.statusEn;
        statusEn = (util.StringUtils.isBlank(statusEn) || statusEn == 'all') ? 'all' : statusEn;
        let data = method.page.getFirst(null);
        data['statusEn'] = statusEn;
        that.setData({
            data: data,
            itemList: [],
            activeTab: statusEn,
        });

        that.loadTabs();
        that.loadMore();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        let that = this;

        that.setData({
            itemList: [],
            loadReady: false,
            data: method.page.getFirst(that.data.data),
        });

        that.loadTabs();
        that.loadMore();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let that = this;

        that.setData({
            data: method.page.getNext(that.data.data),
        });

        that.loadMore();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    bindscrolltolower: function() {
        this.onReachBottom();
    },

    searchChange: function(e) {
        let that = this;

        let keyWord = e.detail;
    },

    toOrderDetail: function(e) {
        let that = this;

        let orderDto = e.currentTarget.dataset.item;
        let orderId = orderDto['orderId'];
        wx.navigateTo({
            url: '/pages/order-detail/index?orderId=' + orderId
        });
    },

    tabOnChange: function(e) {
        let that = this;

        let activeTab = e.detail.name;

        let data = that.data.data;
        data['statusEn'] = activeTab;

        that.setData({
            activeTab: activeTab,
            itemList: [],
            data: method.page.getFirst(data),
        });

        that.loadMore();
    },

    showHideOrderProduct: function(e) {
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

        let promise = method.requestGet('/order-product/query/' + order['orderId']);
        promise.then(function(res) {
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
        }).catch(function(res) {

        }).finally(function(res) {
            wx.hideLoading();
        });

    },

    orderActionClick: function(e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let action = e.currentTarget.dataset.action;
        let order_ = e.currentTarget.dataset.item;

        let orderId = order_['orderId'];

        //再次购买
        if (action === 'buy') {
            //获取当前订单下单产品
            let promise = method.requestGet('/order-product/query/' + orderId);
            promise.then(function(res) {
                let productList = res.data;
                wx.setStorageSync('buyInfo', {
                    productList: productList,
                });
                wx.navigateTo({
                    url: '/pages/order-fill/index'
                });
            });
        }

        //评价，跳转到评价页
        else if (action === 'rate') {
            data['orderStatus'] = 'waitSend';
        }

        //其他
        else {
            let promise = method.requestPost('/business-order/order-operation/' + orderId, {
                action: action,
                statusEn: order_['statusEn']
            });
            promise.then(res => {
                wx.hideLoading();
                wx.showToast({
                    title: '操作成功',
                    icon: 'success',
                    mask: true,
                });

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
            }).catch(res => {
                wx.hideLoading();
                let message = res['message'];
                if (util.StringUtils.isBlank(message)) {
                    message = '当前操作失败，请下拉刷新后重试！';
                }
                wx.showModal({
                    title: '操作失败',
                    content: message,
                    showCancel: false
                });
            });
        }
    },

    loadTabs: function() {
        let that = this;

        let promise = method.requestGet('/order-record/status');
        promise.then(res => {
            let statusList = util.CollectionUtils.addIfPossible([{
                statusEn: 'all',
                statusZh: '全部'
            }], res.data);

            that.setData({
                statusList: statusList,
            });
        }).catch(res => {
            that.setData({
                statusList: [{
                    statusEn: 'all',
                    statusZh: '全部'
                }],
            });
        });
    },

    loadMore: function() {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let data = that.data.data;
        if (util.StringUtils.isBlank(data['statusEn']) || data['statusEn'] == 'all') {
            data['statusEn'] = null;
        }

        let promise = method.requestPost('/order/query', data);
        promise.then(res => {
            let itemList = that.data.itemList;
            itemList = util.CollectionUtils.addIfPossibleThenFilter(itemList, res.data);
            that.setData({
                itemList: itemList,
            });
        }).catch(res => {

        }).finally(res => {
            that.setData({
                loadReady: true,
            });
            wx.hideLoading();
        });
    },

})