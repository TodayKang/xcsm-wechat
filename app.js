//app.js
App({
    onLaunch: function () {
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },

    globalData: {
        wxUserInfo: null,
        xcsmUserInfo: null,

        openId: null,
        unionId: null,

        //  server host
        remoteHost: "https://kangyong.xyz/xcsm_core",

        //当前页和每页大小
        currentPage: 1,
        pageSize: 1000,

        //当前小程序 footer
        footer: {
            text1: "欣昌商贸",
            text2: "1.0.0.RELEASE",
            text3: "Copyright © 2008-2019 xcsm"
        }
    }

})