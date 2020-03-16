// pages/order-fill/index.js
const app = getApp();

let method = require('../../utils/method.js');
let util = require('../../utils/util.js');
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

        let date = method.getPickerDate(null);
        let tokenOnce = Math.random().toString(36).substr(2).toUpperCase();
        that.setData({
            date: date,
            tokenOnce: tokenOnce,
        });

        //当前默认选中: 默认地址（无默认地址，选中第一个）
        wx.setStorageSync('addressIdSelect', null);
        wx.setStorageSync('tokenOnce', tokenOnce);
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

    addressMoreClick: function () {
        let addressId = wx.getStorageSync('addressIdSelect');
        wx.navigateTo({
            url: '/pages/address-list/index?addressId=' + addressId
        });
    },

    bindDateChange: function (e) {
        let date = e.detail.value;
        date = method.getPickerDate(date);
        this.setData({
            date: date,
        })
    },

    toDetailPage: function (e) {
        let item = e.currentTarget.dataset.item;
        wx.navigateTo({
            url: '/pages/product-detail/index?productId=' + item.productId
        });
    },

    createOrder: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let tokenOnce = wx.getStorageSync('tokenOnce');

        let errorMessage = null;
        if (util.StringUtils.isBlank(tokenOnce)) {
            errorMessage = '当前订单';
            if (util.StringUtils.isNotBlank(that.data.orderId)) {
                errorMessage = errorMessage + '【订单编号:' + that.data.orderId + '】';
            }
            errorMessage = errorMessage + '已生成，请到【我的 - 订单】进行付款！';
        }

        let date = that.data.date;
        let address = that.data.address;
        let itemList = that.data.itemList;
        address['arrivedExpect'] = moment(date.date).format('YYYY-MM-DD HH:mm:ss');

        if (util.CollectionUtils.isEmpty(itemList)) {
            errorMessage = '当前产品加载异常，请下拉刷星重试！';
        }

        if (util.StringUtils.isNotBlank(errorMessage)) {
            wx.hideLoading();
            wx.showModal({
                title: '',
                content: errorMessage,
                showCancel: false
            });

            return;
        }

        let buyInfo = wx.getStorageSync('buyInfo');
        let cartIds = buyInfo['cartIds'];

        let promise = method.requestPost('/business-order/create-order', {
            cartIds: cartIds,
            productList: itemList,
            orderDelivery: address
        });
        promise.then(function (res) {
            wx.removeStorageSync('tokenOnce');

            let order = res.data['order'];
            let itemList = res.data['productList'];

            that.setData({
                orderId: order['orderId'],
            })

            that.deleteCartList();
        }).catch(res => {

        }).finally(function (res) {
            wx.hideLoading();
        });
    },

    loadPage: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let addressId = wx.getStorageSync('addressIdSelect');
        let promise1 = method.requestPost('/address/query', {
            addressId: addressId
        });

        let buyInfo = wx.getStorageSync('buyInfo');
        let productList = buyInfo.productList;
        let promise2 = method.requestPost('/business-order/count-price', {
            productList: productList
        });

        Promise.all([promise1, promise2]).then(function (res) {

            let address = res[0].data[0];
            // address = null;
            if (util.ObjectUtils.isNotNull(address)) {
                wx.setStorageSync('addressIdSelect', address['addressId']);
            }

            let order = res[1].data['order'];
            let productList_ = res[1].data['productList'];
            that.setData({
                address: address,
                quantity: order['quantity'],
                payCoupon: order['coupon'],
                payPromotion: order['promotion'],
                payActually: order['pay'],
                payTotal: order['total'],
                payCost: order['cost'],
                payMarket: order['market'],
                itemList: productList_,
            });

        }).catch(function (res) {

        }).finally(function (res) {
            that.setData({
                loadReady: true,
            });
            wx.hideLoading();
        });

    },

    deleteCartList: function () {
        let that = this;

        let buyInfo = wx.getStorageSync('buyInfo');
        let cartIds = buyInfo['cartIds'];
        if (util.CollectionUtils.isEmpty(cartIds)) {
            return;
        }

        let promise = method.requestPost('/cart/delete', {
            cartIds: cartIds
        });
        promise.then(function (res) {

        }).catch(function (res) {

        }).finally(function (res) {

        });
    },

})