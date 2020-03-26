// pages/login-register/index.js

let config = require('../../utils/config.js');
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

    getUserInfo: function (e) {
        let wxUserInfo = e.detail.userInfo;
        console.log(wxUserInfo);
        if (util.ObjectUtils.isNull(wxUserInfo)) {
            wx.showToast({
                title: '操作成功',
                icon: 'success',
                mask: true,
            });
            return;
        }

        let promise1 = method.requestApi.login();


        wx.getUserInfo({
            lang: 'zh_CN',
            success: function (res) {
                console.log(wxUserInfo);
            }
        })

        let data = null;
        // let promise = config.requestPost('', data);

    },

})