// pages/search/index.js

let method = require('../../utils/method.js');
let util = require('../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        itemList: [],
        data: method.page.getFirst(null),
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
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

    searchChange: function(e) {
        let that = this;

        let keyWord = util.StringUtils.trimToBlank(e.detail);
        let data = method.page.getFirst(null);
        data['keyWord'] = keyWord;
        that.setData({
            data: data,
            itemList: [],
            loadReady: false,
        });

        that.loadMore();
    },

    toDetailPage: function(e) {
        let item = e.currentTarget.dataset.item;
        wx.navigateTo({
            url: '/pages/product-detail/index?productId=' + item.productId
        });
    },

    loadMore: function() {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let data = that.data.data;
        if (util.StringUtils.isEmpty(data['keyWord'])) {
            that.setData({
                loadReady: true
            });

            wx.hideLoading();
            return;
        }

        let promise = method.requestPost('/product/query', data);
        promise.then(res => {
            let itemList = that.data.itemList;
            itemList = util.CollectionUtils.addIfPossibleThenFilter(itemList, res.data);
            that.setData({
                itemList: method.product.setStatuses(itemList),
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