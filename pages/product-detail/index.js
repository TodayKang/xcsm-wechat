// pages/product-detail/index.js

let method = require('../../utils/method.js');
let util = require('../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentBuyNum: 1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;

        let productId = options.productId;
        // productId = 174427;
        //初始化数据
        that.setData({
            productId: util.StringUtils.isPositiveInteger(productId) ? parseInt(productId) : null,
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

    countDownRefresh: function () {
        let that = this;
        that.loadPage();
    },

    loadPage: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let productId = that.data.productId;
        if (!util.StringUtils.isPositiveInteger(productId)) {
            wx.hideLoading();
            wx.showModal({
                title: '错误提示',
                content: '当前产品加载错误，请返回重试！',
                showCancel: false
            });

            return;
        }

        let promise1 = method.requestPost('/document/query', {
            productId: productId
        });
        let promise2 = method.requestGet('/product/query/' + productId);
        let promise3 = method.requestPost('/favorite/size', {
            productId: productId
        });
        let promise4 = method.requestPost('/cart/size', {});

        Promise.all([promise1, promise2, promise3, promise4]).then(function (res) {
            let iconList = res[0].data;
            let product = res[1].data;
            let favoriteSize = res[2].data;
            let cartSize = res[3].data;

            product = method.product.setStatus(product);
            if (!util.StringUtils.isBlank(product['productIcon'])) {
                let iconList_ = [{
                    fkId: productId,
                    path: product['productIcon']
                }];
                iconList = iconList_.concat(iconList);
            }

            that.setData({
                iconList: iconList,
                product: product,
                favoriteSize: favoriteSize,
                cartSize: cartSize,
            });

        }).catch(function (res) {

        }).finally(function (res) {
            that.setData({
                loadReady: true,
            })
            wx.hideLoading();
        });

    },

    abnorClick: function (e) {
        wx.switchTab({
            url: "/pages/category/index"
        });
    },

    buyNumberClick: function (e) {
        let that = this;
        let productId = that.data.productId;

        // let promise = config.requestGet('/product/query/' + productId);
        // promise.then(function (res) {
        //     let product = res.data;
        //     let amountRest = product['amountRest'];
        //     let amountOnce = product['amountOnce'];
        //
        // }).catch(function (res) {
        //
        // }).finally(function (res) {
        //
        // });

        let currentBuyNum = e.detail;

        that.setData({
            currentBuyNum: currentBuyNum
        })

        // wx.showModal({
        //     title: '产品限购',
        //     content: '当前产品最多可购买数量为:' + maxBuyNum,
        //     showCancel: false,
        //     confirmColor: '#4A4A4A'
        // });
    },

    //跳转到购物车
    cartOnClick: function (e) {
        let that = this;
        wx.switchTab({
            url: '/pages/cart/index'
        });
    },

    // 收藏或是取消收藏
    favoriteOnClick: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let promise = null;
        let message = null;

        let data = {
            productId: that.data.productId
        };

        //当前已收藏
        let favoriteSize = that.data.favoriteSize;
        if (util.StringUtils.isPositiveInteger(favoriteSize) && favoriteSize > 0) {
            favoriteSize = 0;
            message = '取消收藏成功';
            promise = method.requestPost('/favorite/delete', data);
        } else {
            favoriteSize = 1;
            message = '收藏成功';
            promise = method.requestPost('/favorite/save', data);
        }

        promise.then(function (res) {
            that.setData({
                favoriteSize: favoriteSize
            });
            wx.showToast({
                title: message,
                icon: 'success',
                mask: true
            });
        }).finally(function (res) {
            wx.hideLoading();
        });
    },

    //添加到购物车
    addCart: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let promise = method.requestPost('/cart/save', {
            productId: that.data.productId,
            quantity: that.data.currentBuyNum
        });

        promise = promise.then(res => {
            return method.requestPost('/cart/size', {});
        }).catch(res => {
            Promise.reject(res);
        });

        promise.then(res => {
            that.setData({
                cartSize: res.data,
            });

            wx.showToast({
                title: '添加成功',
                icon: 'success',
                mask: true
            });
        }).catch(res => {
            wx.showModal({
                title: '服务器错误',
                content: '当前产品添加购物车失败，请重试！',
                showCancel: false
            });
        }).finally(res => {
            wx.hideLoading();
        });
    },

    // 立即购买
    buyNow: function (e) {
        let that = this;

        let productId = that.data.productId;
        let currentBuyNum = that.data.currentBuyNum;

        if (!util.StringUtils.isPositiveInteger(productId) || !util.StringUtils.isPositiveInteger(currentBuyNum)) {
            wx.showModal({
                title: '错误提示',
                content: '当前产品加载错误，请下拉刷新重试！',
                showCancel: false
            });

            return;
        }

        wx.setStorageSync('buyInfo', {
            productList: [{
                'productId': productId,
                'quantity': currentBuyNum
            }]
        });
        wx.navigateTo({
            url: '/pages/order-fill/index'
        });
    },

})