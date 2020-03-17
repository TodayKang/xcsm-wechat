// pages/order-detail/index.js

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
    onLoad: function (options) {
        let that = this;

        let orderId = options.orderId;
        // orderId = 168;
        that.setData({
            orderId: orderId,
        });
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
        let that = this;
        that.loadPage();
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    makePhoneCall: function (e) {
        let phone = e.currentTarget.dataset.phone;
        if (method.isStrBlank(phone)) {
            return;
        }

        wx.makePhoneCall({
            phoneNumber: phone
        })
    },

    orderActionClick: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let order_ = e.currentTarget.dataset.item;
        let orderId = order_['orderId'];

        let action = e.currentTarget.dataset.action;
        //再次购买
        if (action === 'buy') {
            //获取当前订单下单产品
            let promise = method.requestGet('/order-product/query/' + orderId);
            promise.then(function (res) {
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
                wx.showToast({
                    title: '操作成功',
                    icon: 'success',
                    mask: true,
                });

                wx.hideLoading();
                //刷新整个页面
                that.loadPage();
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

    loadPage: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let orderId = that.data.orderId;
        if (!util.StringUtils.isPositiveInteger(orderId)) {
            wx.hideLoading();
            return;
        }

        let promise1 = method.requestGet('/order-record/query/' + orderId);
        let promise2 = method.requestGet('/order-delivery/query/' + orderId);
        let promise3 = method.requestGet('/order/query/' + orderId);
        let promise4 = method.requestGet('/order-product/query/' + orderId);

        Promise.all([promise1, promise2, promise3, promise4]).then(res => {
            let recordList = res[0].data;
            let delivery = res[1].data;
            let order = res[2].data;
            let productList = res[3].data;

            that.setData({
                recordList: recordList,
                delivery: delivery,
                order: order,
                item: order,
                productList: productList,
            });
        }).catch(res => {

        }).finally(res => {
            that.setData({
                loadReady: true
            });
            wx.hideLoading();
        });
    },

})