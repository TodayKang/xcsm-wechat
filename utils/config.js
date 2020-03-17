const host = 'http://127.0.0.1:8080/shop_core';
const timeout = 5 * 1000;
const pageSize = 20;

const weekCn_ = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const statusProduct_ = {
    'DELETE': {
        status: 'DELETE',
        title: '已下线',
        text: '当前产品已经下架了，去看看其他的吧~~'

    }, 'OFFLINE': {
        status: 'OFFLINE',
        title: '不可售',
        text: '当前产品暂不可售，去看看其他的吧~~'
    }, 'OVER': {
        status: 'OVER',
        title: '已结束',
        text: '当前产品活动期已结束，下次早点来哟~~'
    }, 'NOW': {
        status: 'NOW',
        title: '距离活动结束还剩',
        text: '当前产品正常售卖中，喜欢的话立即来抢购哟~~'
    }, 'FUTURE': {
        status: 'FUTURE',
        title: '距活动开始仅剩',
        text: '当前产品正常售卖中，喜欢的话立即来抢购哟~~'
    }, 'NONE': {
        status: 'NONE',
        title: '已售罄',
        text: '当前产品太火爆了，已经卖完啦~~'
    }
};

function requestGet(url) {
    let promise = new Promise(function (resolve, reject) {
        wx.request({
            url: host + url,
            method: 'GET',
            header: {},
            timeout: timeout,
            success(res) {
                if (res.data['status'] === true) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail(res) {
                reject(res.data);
            },
            complete(res) {

            }
        });
    });

    return promise;
}

function requestPost(url, data = {}) {
    let promise = new Promise(function (resolve, reject) {
        wx.request({
            url: host + url,
            data: data,
            method: 'POST',
            header: {},
            timeout: timeout,
            success(res) {
                if (res.data['status'] === true) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail(res) {
                reject(res.data);
            },
            complete(res) {

            }
        });
    });

    return promise;
}

module.exports = {
    timeout,
    host,
    weekCn_,
    pageSize,
    statusProduct_,

    requestGet,
    requestPost,
}