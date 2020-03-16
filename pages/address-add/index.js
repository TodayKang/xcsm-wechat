// pages/my-address-add/index.js

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

        let addressId = options.addressId;
        that.setData({
            addressId: addressId,
        });
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
        let that = this;
        that.loadPage();
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
        that.loadPage();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    regionChange: function(e) {
        let currentRegion = e.detail.value;
        this.setData({
            currentRegion: currentRegion
        })
    },

    checkAddress: function(address) {
        let errorMessage = null;
        if (util.StringUtils.isBlank(address)) {
            errorMessage = '请填写联系人姓名';
        }

        if (errorMessage == null && util.StringUtils.isBlank(address['realName'])) {
            errorMessage = '请填写联系人姓名';
        }

        address['realName'] = address['realName'].trim();
        if (errorMessage == null && address['realName'].length > 10) {
            errorMessage = '联系人姓名不超过10汉字';
        }

        if (errorMessage == null && !(address['gender'] == 'M' || address['gender'] == 'F')) {
            errorMessage = '性别未选择，请选择性别';
        }

        if (errorMessage == null && util.StringUtils.isBlank(address['phone'])) {
            errorMessage = '请正确填写11位手机号码';
        }

        address['phone'] = address['phone'].trim();
        if (errorMessage == null && !util.StringUtils.isPhone(address['phone'])) {
            errorMessage = '请正确填写11位手机号码';
        }

        address['email'] = address['email'].trim();
        if (errorMessage == null && !util.StringUtils.isEmail(address['email'])) {
            errorMessage = '电子邮箱地址不合法';
        }

        if (errorMessage == null && (util.StringUtils.isBlank(address['province']) || address['province'] == '请选择')) {
            errorMessage = '请选择正确的省份名称';
        }

        if (errorMessage == null && (util.StringUtils.isBlank(address['city']) || address['city'] == '请选择')) {
            errorMessage = '请选择正确的市级名称';
        }

        if (errorMessage == null && (util.StringUtils.isBlank(address['district']) || address['district'] == '请选择')) {
            errorMessage = '请选择正确的区县名称';
        }

        if (errorMessage == null && (util.StringUtils.isBlank(address['detail']))) {
            errorMessage = '请填写地址详细信息';
        }

        address['detail'] = address['detail'].trim();
        if (errorMessage == null && address['detail'].length <= 6) {
            errorMessage = '详细地址太过简单，请重新填写！';
        }

        if (util.StringUtils.isBlank(address['postCode'])) {
            address['postCode'] = '000000';
        }

        address['postCode'] = address['postCode'].trim();
        if (errorMessage == null && address['postCode'].length > 6) {
            errorMessage = '邮政编码填写不合法，请重新填写！';
        }

        return errorMessage;
    },

    genderClick: function(e) {
        let that = this;

        let gender = e.currentTarget.dataset.gender;
        if (gender == 'M' || gender == 'F') {
            that.setData({
                gender: gender
            });
        }
    },

    addressSave: function(e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let address = e.detail.value;
        let currentRegion = that.data.currentRegion;
        address['country'] = '中国';
        address['province'] = currentRegion[0];
        address['city'] = currentRegion[0];
        address['district'] = currentRegion[0];

        let errorMessage = that.checkAddress(address);

        if (util.StringUtils.isNotBlank(errorMessage)) {
            wx.showModal({
                title: '填写错误',
                content: errorMessage,
                showCancel: false,
                confirmColor: '#4A4A4A'
            });

            wx.hideLoading();
            return;
        }
        let title = util.StringUtils.isPositiveInteger(address.addressId) ? '修改成功' : '添加成功';
        let url = util.StringUtils.isPositiveInteger(address.addressId) ? '/address/update' : '/address/save';
        let promise = method.requestPost(url, address);
        promise = promise.then(function(res) {
            return method.requestGet('/address/query/' + res.data.addressId);
        }).catch(function() {
            return Promise.reject();
        });

        promise.then(res => {
            that.setData({
                addressId: res.data.addressId,
                address: res.data,
            });
            wx.showToast({
                title: title,
                icon: 'success',
                mask: true
            });
        }).catch(res => {

        }).finally(res => {
            wx.hideLoading();
        });
    },

    addressCancel: function() {
        wx.navigateBack({});
    },

    loadPage: function() {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let currentRegion = ['湖北省', '十堰市', '请选择'];
        let addressId = that.data.addressId;
        if (!util.StringUtils.isPositiveInteger(addressId)) {
            that.setData({
                currentRegion: currentRegion,
            });

            wx.hideLoading();
            return;
        }

        let promise = method.requestGet('/address/query/' + addressId);
        promise.then(function(res) {
            let address = res.data;
            if (util.ObjectUtils.isNotNull(address)) {
                currentRegion[0] = address['province'];
                currentRegion[1] = address['city'];
                currentRegion[2] = address['district'];
            }

            that.setData({
                address: address,
                gender: address.gender,
                currentRegion: currentRegion,
            });
        }).catch(function(res) {
            that.setData({
                currentRegion: currentRegion,
            });
        }).finally(function() {
            wx.hideLoading();
        });

    },

})