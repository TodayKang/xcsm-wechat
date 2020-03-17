let moment = require("../miniprogram_npm/moment/index.js");
let config = require('../utils/config.js');
let util = require('../utils/util.js');

function requestGet(url) {
    let promise = new Promise(function (resolve, reject) {
        wx.request({
            url: config.host + url,
            method: 'GET',
            header: {},
            timeout: config.timeout,
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
            url: config.host + url,
            data: data,
            method: 'POST',
            header: {},
            timeout: config.timeout,
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

let requestApi = {

    /**
     * 通过 JS Code 登录
     * @returns {Promise<unknown>}
     */
    login: function () {
        let that = this;

        let promise = new Promise((resolve, reject) => {
            //微信前端登录获取 js_code
            wx.login({
                success(res) {
                    resolve(res);
                }
            });
        });

        promise = promise.then(res => {
            //失败
            if (util.StringUtils.isBlank(res['code'])) {
                return Promise.reject(res);
            }

            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            return config.requestGet('/auth/login/' + res.code);
        }).catch(res => {
            //失败
            return Promise.reject(res);
        });

        //服务端登录完成
        promise = promise.then(res => {
            let customer = res['customer'];
            wx.setStorageSync("customerInfo", customer);
            return Promise.resolve(res);
        }).catch(res => {
            return Promise.resolve(res);
        });

        return promise;
    },

}

let page = {
    /**
     * 获取第一页
     * @param data
     * @returns {{}|*}
     */
    getFirst: function (data) {
        data = this.init(data);
        data['currentPage'] = 1;
        return data;
    },

    /**
     * 获取当前下一页
     * @param data
     */
    getNext: function (data) {
        data = this.init(data);
        data['currentPage'] = parseInt(data['currentPage']) + 1;
        return data;
    },

    /**
     * 初始化页码
     * @param data
     * @returns {*}
     */
    init: function (data) {
        data = util.ObjectUtils.isNull(data) ? {} : data;
        if (!util.StringUtils.isPositiveInteger(data['currentPage'])) {
            data['currentPage'] = 1;
        }

        if (!util.StringUtils.isPositiveInteger(data['pageSize'])) {
            data['pageSize'] = config.pageSize;
        }

        return data;
    },

}

function getPickerDate(strDate) {
    let that = this;

    strDate = util.StringUtils.isBlank(strDate) ? moment().format('YYYY-MM-DD') : strDate;
    let today = moment().format('YYYY-MM-DD');
    let date = moment(strDate).format('YYYY-MM-DD');
    let weekCn = util.getWeekCn(moment(strDate).format('d'));
    //Sunday Monday ... Friday Saturday
    let weekEn = moment(strDate).format('dddd');
    let week = '(' + weekCn + '-' + weekEn + ')';

    let date_ = {
        today: today,
        date: date,
        week: week,
        weekCn: weekCn,
        weekEn: weekEn,
    };

    return date_;
}

let product = {

    setStatus: function (item) {
        if (util.ObjectUtils.isNull(item)) {
            return null;
        }

        let status_ = config.statusProduct_['DELETE'];

        //产品售罄
        if (item['deleteFlag'] === 'N' && item['saleFlag'] === 'Y' && util.ObjectUtils.isNotNull(item['onlineStart'])
            && util.ObjectUtils.isNotNull(item['onlineEnd'])
            && moment(item['onlineStart']).valueOf() <= moment.utc().valueOf()
            && moment(item['onlineStart']).valueOf() > moment.utc().valueOf()) {

            // status_ = config.statusProduct_['NONE'];
            // item['status_'] = status_;
            // return item;
        }

        //产品已删除
        if (item['deleteFlag'] !== 'N' || util.ObjectUtils.isNull(item['onlineStart']) || util.ObjectUtils.isNull(item['onlineEnd'])) {
            status_ = config.statusProduct_['DELETE'];
        }

        //不可售
        else if (item['saleFlag'] !== 'Y') {
            status_ = config.statusProduct_['OFFLINE'];
        }

        //活动期已结束
        else if (moment(item['onlineEnd']).valueOf() < moment.utc().valueOf()) {
            status_ = config.statusProduct_['OVER'];
        }

        //当前售卖中
        else if (moment(item['onlineStart']).valueOf() <= moment.utc().valueOf()
            && moment(item['onlineEnd']).valueOf() > moment.utc().valueOf()) {
            status_ = config.statusProduct_['NOW'];
            status_['second'] = moment(item['onlineEnd']).valueOf() - moment.utc().valueOf();
        }

        //将来售卖
        else if (moment(item['onlineStart']).valueOf() > moment.utc().valueOf()) {
            status_ = config.statusProduct_['FUTURE'];
            status_['second'] = moment(item['onlineStart']).valueOf() - moment.utc().valueOf();
        }

        item['status_'] = status_;
        return item;
    },

    setStatuses: function (list = []) {
        if (util.CollectionUtils.isEmpty(list)) {
            return null;
        }

        list.forEach((item, index) => {
            item = this.setStatus(item);
        });

        return list;
    },

}

module.exports = {
    requestGet,
    requestPost,
    requestApi,

    page,
    product,

    getPickerDate,
}