let config = require('../utils/config.js');

let CollectionUtils = {

    isCollection: function (coll) {
        return Array.isArray(coll);
    },

    isNotCollection: function (coll) {
        return !this.isCollection(coll);
    },

    isEmpty: function (coll) {
        return coll == undefined || coll == null || coll.length === 0;
    },

    isNotEmpty: function (coll) {
        return !this.isEmpty(coll);
    },

    size: function (coll) {
        return coll.length;
    },

    add: function (coll, item) {
        coll.put(item);
        return coll;
    },

    addAll: function (coll, iterable) {
        coll = coll.concat(iterable);
        return coll;
    },

    addIfPossible: function (coll, collAdd) {
        let that = this;
        coll = that.isEmpty(coll) ? [] : coll;

        if (that.isNotEmpty(collAdd)) {
            coll = coll.concat(collAdd);
        }

        return coll;
    },

    addIfPossibleThenFilter: function (coll, collAdd) {
        coll = this.addIfPossible(coll, collAdd);
        return Array.from(new Set(coll));
    },

    filterRepeat: function (coll) {
        return Array.from(new Set(coll));
    },

    remove: function (coll, index) {
        for (let index_ in coll) {
            if (index_ == index) {
                coll.splice(index, 1);
                break;
            }
        }

        return coll;
    },

    removeByKey: function (coll, item, key) {
        for (let index in coll) {
            if (coll[index]['"' + key + '"'] === item['"' + key + '"']) {
                coll.splice(index, 1);
                break;
            }
        }

        return coll;
    },

}

let ObjectUtils = {
    isNull: function (object) {
        if (object == undefined || object == null) {
            return true;
        }

        return false;
    },

    isNotNull: function (object) {
        return !this.isNull(object);
    },
}

let StringUtils = {
    isEmpty: function (str) {
        return str == undefined || str == null || str == '';
    },

    isNotEmpty: function (str) {
        return !this.isEmpty(str);
    },

    isBlank: function (str) {
        return str == undefined || str == null || /^\s*$/.test(str);
    },

    isNotBlank: function (str) {
        return !this.isBlank(str);
    },

    trim: function (str) {
        return str.replace(/^\s+|\s+$/, '');
    },

    trimToEmpty: function (str) {
        return str == null ? '' : this.trim(str);
    },

    trimToBlank: function (str) {
        return (str == null || str == '') ? null : this.trim(str);
    },

    startsWith: function (str, prefix) {
        return str.indexOf(prefix) === 0;
    },

    endsWith: function (str, suffix) {
        return str.lastIndexOf(suffix) === 0;
    },

    contains: function (str, searchSeq) {
        return str.indexOf(searchSeq) >= 0;
    },

    equals: function (str1, str2) {
        return str1 == str2;
    },

    equalsIgnoreCase: function (str1, str2) {
        return str1.toLocaleLowerCase() == str2.toLocaleLowerCase();
    },

    containsWhitespace: function (str) {
        return this.contains(str, ' ');
    },

    isEmail: function (str) {
        return /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(str);
    },

    isPhone: function (str) {
        return /0?(13|14|15|18|17)[0-9]{9}/.test(str);
    },

    //只包含字母
    isAlpha: function (str) {
        return /^[a-zA-Z]+$/i.test(str);
    },

    //是否为中文字符
    isCnAlphanumeric: function (str) {
        return;
    },

    //只包含字母、空格
    isAlphaSpace: function (str) {
        return /^[a-zA-Z\s]*$/i.test(str);
    },

    //只包含字母、数字
    isAlphanumeric: function (str) {
        return /^[a-zA-Z0-9]+$/i.test(str);
    },

    //只包含字母、数字和空格
    isAlphanumericSpace: function (str) {
        return /^[a-zA-Z0-9\s]*$/i.test(str);
    },

    //数字
    isNumeric: function (str) {
        return;
    },

    //小数
    isDecimal: function (str) {
        return;
    },

    //负小数
    isNegativeDecimal: function (str) {
        return;
    },

    //正小数
    isPositiveDecimal: function (str) {
        return;
    },

    //整数: 正整数 或 0 或 负整数
    isInteger: function (str) {
        return;
    },

    //正整数
    isPositiveInteger: function (str) {
        return /^[1-9]\d*$/.test(str);
    },

    //负整数
    isNegativeInteger: function (str) {
        return /^\-[1-9]\d*$/.test(str);
    },

    //只包含数字和空格
    isNumericSpace: function (str) {
        return /^[\d\s]*$/.test(str);
    },

}

/**
 * 获取中文星期
 * @param number
 * @returns {string|null}
 */
function getWeekCn(week) {
    let weekCn = (week < 0 || week > 6) ? null : config.weekCn_[week];
    return weekCn;
}

module.exports = {
    CollectionUtils,
    ObjectUtils,
    StringUtils,
    getWeekCn,
}
