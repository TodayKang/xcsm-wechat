// pages/my/index.js

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

    loadPage: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let promise = method.requestApi.login();
        promise.then(res => {
            console.log('当前用户注册信息:' + JSON.stringify(res))
            //用户还未注册，故不能登录
            if (res['customer'] == null) {
                return;
            }

            let customer = res['customer'];

            that.setData({
                customer: customer
            });

            that.loadMyPageData();
        }).finally(res => {
            wx.hideLoading();
        });
    },

    loadMyPageData: function () {
        let that = this;

        let customer = that.data.customer;
        if (util.ObjectUtils.isNull(customer)) {
            return;
        }

        let promise1 = method.requestPost('/favorite/size', {});
        let promise2 = method.requestPost('/cart/size', {});
        let promise3 = method.requestPost('/order/size', {
            statusEn: 'waitPay'
        });
        let promise4 = method.requestPost('/order/size', {
            statusEn: 'waitSend'
        });
        let promise5 = method.requestPost('/order/size', {
            statusEn: 'hasConfirm'
        });
        let promise6 = method.requestPost('/order/size', {
            statusEn: 'waitRate'
        });
        let promise7 = method.requestPost('/order/size', {
            statusEn: 'waitRefund'
        });

        Promise.all([promise1, promise2, promise3, promise4, promise5, promise6, promise7])
            .then(function (res) {
                let sizeFavorite = res[0].data;
                let sizeCart = res[1].data;
                let sizeOrderWaitPay = res[2].data;
                let sizeOrderWaitSend = res[3].data;
                let sizeOrderWaitConfirm = res[4].data;
                let sizeOrderWaitRate = res[5].data;
                let sizeOrderWaitRefund = res[6].data;

                that.setData({
                    sizeFavorite: sizeFavorite,
                    sizeCart: sizeCart,
                    sizeOrderWaitPay: sizeOrderWaitPay,
                    sizeOrderWaitSend: sizeOrderWaitSend,
                    sizeOrderWaitConfirm: sizeOrderWaitConfirm,
                    sizeOrderWaitRate: sizeOrderWaitRate,
                    sizeOrderWaitRefund: sizeOrderWaitRefund,
                });
            }).catch(function (res) {

        }).finally(function (res) {
            wx.hideLoading();
        });
    },

    toPage: function (e) {
        let detail = e.currentTarget.dataset.detail;

        //wx.switchTab

        if (detail === 'cart') {
            wx.switchTab({
                url: '/pages/cart/index'
            });

            return;
        }

        let url = null;
        switch (detail) {
            case 'favorite':
                url = '/pages/favorite/index';
                break;
            case 'cart':
                url = '/pages/cart/index';
                break;
            case 'footprint':
                url = '/pages/footprint/index';
                break;
            case 'coupon':
                url = '/pages/coupon/index';
                break;
            case 'orderAll':
                url = '/pages/order-my/index?statusEn=';
                break;
            case 'waitPay':
                url = '/pages/order-my/index?statusEn=' + 'waitPay';
                break;
            case 'waitSend':
                url = '/pages/order-my/index?statusEn=' + 'waitSend';
                break;
            case 'waitConfirm':
                url = '/pages/order-my/index?statusEn=' + 'waitConfirm';
                break;
            case 'waitRate':
                url = '/pages/order-my/index?statusEn=' + 'waitRate';
                break;
            case 'refund':
                url = '/pages/order-my/index?statusEn=' + 'waitRefund';
                break;
            default:
                break;
        }

        if (method.isStrBlank(url)) {
            return;
        }

        wx.navigateTo({
            url: url
        });
    },

    getUserInfo: function (e) {
        let that = this;
        console.log('registerClick:' + JSON.stringify(e));

        let userInfo = e.detail.userInfo;
        // userInfo = null;
        // if (method.isStrBlank(userInfo)) {
        //     wx.showModal({
        //         title: '您还没有授权',
        //         content: '是否前往授权登录/注册成为用户',
        //     });
        //
        //     wx.showToast({
        //         title: '您还没有授权',
        //         icon: 'success',
        //         mask: true
        //     })
        // }

    }

})