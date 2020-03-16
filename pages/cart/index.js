// pages/cart/index.js

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
    onLoad: function (options) {
        let that = this;
        // that.loadPage();
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
        that.countPrice();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;

        that.setData({
            data: method.page.getNext(that.data.data),
        });
        that.loadMore();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    bindscrolltolower: function () {
        this.onReachBottom();
    },

    //点击编辑或是完成事件
    editOnClick: function () {
        let that = this;

        let showEdit = that.data.showEdit;
        showEdit = (showEdit === true) ? false : true;
        that.setData({
            showEdit: showEdit,
        });

        that.countPrice();
    },

    //购物车为空事件
    abnorClick: function (e) {
        wx.switchTab({
            url: '/pages/category/index'
        });
    },

    //点击跳转详情页事件
    toDetailPage: function (e) {
        let item = e.currentTarget.dataset.item;
        wx.navigateTo({
            url: '/pages/product-detail/index?productId=' + item.productId
        });
    },

    //开始触摸时事件
    touchStartOn: function (e) {
        if (e.touches.length == 1) {
            this.setData({
                startX: e.touches[0].clientX,
                startY: e.touches[0].clientY
            });
        }
    },

    //滑动事件处理事件
    touchMoveOn: function (e) {
        let that = this;

        let item = e.currentTarget.dataset.item;
        let currentTouchId = -1;

        let endX = e.touches[0].clientX;
        let distX = endX - that.data.startX;

        // 向左向右滑动需要超过一定幅度
        if (distX < 10 && distX > -10) {
            return;
        } else if (distX < 0) {
            // 左滑展示删除
            currentTouchId = item.cartId;
        } else {
            // 右滑不展示删除
            currentTouchId = -1;
        }

        that.setData({
            currentTouchId: currentTouchId
        });
    },

    //点击左侧图标事件
    selectItemClick: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let itemList = that.data.itemList;
        let item_ = e.currentTarget.dataset.item;

        for (let index in itemList) {
            if (itemList[index].cartId === item_.cartId) {
                itemList[index]['selected'] = (item_['selected'] === true) ? false : true;
                break;
            }
        }

        that.setData({
            itemList: itemList,
        });

        wx.hideLoading();
        that.countPrice();
    },

    buyNumberClick: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let currentBuyNum = e.detail;
        let item = e.currentTarget.dataset.item;
        let promise = method.requestPost('/cart/save', {
            cartId: item.cartId,
            productId: item.productId,
            quantity: currentBuyNum
        });
        promise.then(function (res) {
            let itemList = that.data.itemList;
            for (let index in itemList) {
                if (itemList[index].cartId == item.cartId) {
                    itemList[index].quantity = currentBuyNum;
                    break;
                }
            }

            that.setData({
                itemList: itemList,
            });

            wx.hideLoading();
            that.countPrice();
        });

    },

    deleteItem: function (e) {
        let that = this;
        wx.showLoading({
            mask: true
        });

        // 从购物车中删除
        let item = e.currentTarget.dataset.item;
        let promise = method.requestPost('/cart/delete', {
            cartId: item.cartId,
            productId: item.productId
        });
        promise.then(function (res) {
            let itemList = that.data.itemList;
            itemList = util.CollectionUtils.removeByKey(itemList, item, 'cartId');
            that.setData({
                itemList: itemList,
            });

            wx.showToast({
                title: '删除成功',
                icon: 'success',
                mask: true
            });
            that.countPrice();
        }).finally(function (res) {
            wx.hideLoading();
        });

    },

    selectAllOnClick: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let itemList = that.data.itemList;
        let selectAll = that.data.selectAll;
        selectAll = (selectAll === true) ? true : false;
        //当前已经是全部，点击则取消全部
        for (let i = 0; i < itemList.length; i++) {
            itemList[i].selected = !selectAll;
        }

        that.setData({
            selectAll: !selectAll,
            itemList: itemList
        });

        wx.hideLoading();
        that.countPrice();
    },

    toOrderPageOnClick: function (e) {
        let that = this;

        let showEdit = that.data.showEdit;
        let itemList = that.data.itemList;

        let cartIds = [];
        let productList = [];
        itemList.forEach(function (item, index) {
            if (item.selected === true) {
                cartIds.push(item.cartId);
                productList.push(item);
            }
        });

        if (showEdit !== true || util.CollectionUtils.isEmpty(productList)) {
            wx.showModal({
                title: '请选择产品',
                content: '当前您未选择任何产品，请选择产品！',
                showCancel: false
            });
            return;
        }

        wx.showLoading({
            mask: true
        });

        let buyInfo = {
            productList: productList,
            cartIds: cartIds
        };

        wx.setStorageSync('buyInfo', buyInfo);

        wx.navigateTo({
            url: '/pages/order-fill/index'
        });
    },

    deleteSelectedOnClick: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let itemList = that.data.itemList;
        if (util.CollectionUtils.isEmpty(itemList)) {
            wx.hideLoading();
            return;
        }

        let cartIds = [];
        let itemList_ = [];
        itemList.forEach(function (item, index) {
            if (item.selected === true) {
                cartIds.push(item.cartId);
                // itemList.splice(index, 1);
            } else {
                itemList_.push(item);
            }
        });

        if (util.CollectionUtils.isEmpty(cartIds)) {
            wx.hideLoading();
            return;
        }

        let promise = method.requestPost('/cart/delete', {
            cartIds: cartIds
        });
        promise.then(function (res) {
            that.setData({
                itemList: itemList_,
            });

            wx.showToast({
                title: '删除成功',
                icon: 'success',
                mask: true
            });
        }).finally(function (res) {
            wx.hideLoading();
            that.countPrice();
        });
    },

    loadPage: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let data = method.page.getFirst(null);
        let promise = method.requestPost('/cart/query', data);
        promise.then(function (res) {
            let itemList = util.CollectionUtils.addIfPossible([], res.data);
            that.setData({
                data: data,
                itemList: method.product.setStatuses(itemList),
            });
        }).catch(function (res) {

        }).finally(function (res) {
            that.setData({
                loadReady: true,
                showEdit: true,
                selectNone: true,
                selectAll: false,
                loadReady: true,
                currentTouchId: -1,
                selectQuantity: null,
            });
            wx.hideLoading();
        });
    },

    loadMore: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        let data = that.data.data;
        let promise = method.requestPost('/cart/query', data);
        promise.then(res => {
            let itemList = that.data.itemList;
            itemList = util.CollectionUtils.addIfPossibleThenFilter(itemList, res.data);
            itemList.forEach((item, index) => {
                item = method.product.setStatus(item);
                if (that.data.selectAll == true) {
                    item['selected'] = true;
                }
            });
            that.setData({
                itemList: method.product.setStatuses(itemList),
            });

            that.countPrice();
        }).catch(res => {

        }).finally(res => {
            that.setData({
                loadReady: true,
            });
            wx.hideLoading();
        });
    },

    //算价，显示编辑的时候才算价
    countPrice: function () {
        let that = this;
        wx.showLoading({
            mask: true
        });

        that.setData({
            selectQuantity: null,
            payTotal: null,
            payOught: null,
            payCost: null,
        });

        let showEdit = that.data.showEdit;
        showEdit = (showEdit === true) ? true : false;

        let productList = [];
        let itemList = that.data.itemList;
        if (util.CollectionUtils.isEmpty(itemList)) {
            that.setData({
                loadReady: true
            });
            return;
        }

        itemList.forEach(function (item, index) {
            if (item.selected === true) {
                productList.push(item);
            }
        });

        let selectQuantity = (productList.length > 0) ? productList.length : null;

        let selectNone = false;
        if (util.CollectionUtils.isEmpty(productList)) {
            selectNone = true;
        }

        let selectAll = false;
        if (itemList.length === productList.length) {
            selectAll = true;
        }

        // 重置当前选择的图标
        that.setData({
            selectQuantity: selectQuantity,
            selectNone: selectNone,
            selectAll: selectAll,
        });

        //当前是删除或是没有选中，不需要算价
        if (!showEdit || util.CollectionUtils.isEmpty(productList)) {
            wx.hideLoading();
            return;
        }

        let data = {
            productList: productList
        };
        let promise = method.requestPost('/business-order/count-price', data);
        promise.then(function (res) {
            let order = res.data['order'];
            let productList_ = res.data['productList'];
            that.setData({
                quantity: order['quantity'],
                payCoupon: order['coupon'],
                payPromotion: order['promotion'],
                payActually: order['pay'],
                payTotal: order['total'],
                payCost: order['cost'],
                payMarket: order['market'],
                productList: productList_,
            });
        }).finally(function (resp) {
            that.setData({
                loadReady: true
            });
            wx.hideLoading();
        });
    },

})