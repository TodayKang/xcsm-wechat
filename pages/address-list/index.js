// pages/my-address/index.js

let method = require('../../utils/method.js');
let util = require('../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        itemList: [],
        addressIdSelected: null,
        data: method.page.getFirst(null),
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;

        let addressId = options.addressId;
        // addressId = 5;
        that.setData({
            addressId: addressId,
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
        that.loadMore();
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

        that.setData({
            itemList: [],
            data: method.page.getFirst(that.data.data),
        });
        that.loadMore();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;

        that.setData({
            data: method.page.getNext(that.data.data)
        });
        that.loadMore();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    loadMore: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let data = that.data.data;
        let promise = method.requestPost('/address/query', data);
        promise.then(res => {
            let itemList = that.data.itemList;
            itemList = util.CollectionUtils.addIfPossibleThenFilter(itemList, res.data);
            that.setData({
                itemList: itemList
            });
        }).catch(res => {

        }).finally(res => {
            that.setData({
                loadReady: true
            });
            wx.hideLoading();
        });
    },

    currentAddressClick: function (e) {
        let item = e.currentTarget.dataset.item;
        wx.setStorageSync('addressIdSelect', item['addressId']);
        wx.navigateBack({});
    },

    addressEditOrNew: function (e) {
        let item = e.currentTarget.dataset.item;
        let addressId = item.addressId;
        wx.navigateTo({
            url: "/pages/address-add/index?addressId=" + addressId
        });
    },

    addressDelete: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let item = e.currentTarget.dataset.item;
        let promise = method.requestPost('/address/delete', {
            addressId: item.addressId
        });
        promise.then(function (res) {
            let itemList = that.data.itemList;
            that.setData({
                itemList: util.CollectionUtils.removeByKey(itemList, item, 'cartId'),
            });
        }).catch(function (res) {

        }).finally(function () {
            wx.hideLoading();

            wx.showToast({
                title: '删除成功',
                icon: 'success',
                mask: true
            });
        });
    },

})