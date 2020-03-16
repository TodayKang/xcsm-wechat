// pages/order-detail/index.js

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

        let orderId = options.orderId;
        orderId = 167;
        orderId = method.isPInteger(orderId) ? parseInt(orderId) : null;
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
            wx.hideLoading();
            //刷新整个页面
            that.loadPage();
            return Promise.resolve();
        }).catch(res => {
             return Promise.reject();
        }).then(res => {
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
                statusList: statusList,
                activeTab: statusList[0]['statusEn'],
            });
        }).catch(function (res) {

        }).finally(function (res) {
            that.setData({
                loadReady: true,
            });
            wx.hideLoading();
        });
    },

    loadPage: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let orderId = that.data.orderId;
        if (!method.isPInteger(orderId)) {
            wx.hideLoading();
            return;
        }

        let promise1 = config.requestGet('/order-record/query/' + orderId);
        let promise2 = config.requestGet('/order-delivery/query/' + orderId);
        let promise3 = config.requestGet('/order/query/' + orderId);
        let promise4 = config.requestGet('/order-product/query/' + orderId);

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