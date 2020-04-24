app.service("informationService", ["$location",
    function ($location) {

        var regMap = {
            /* 验证邮箱 */
            "email": /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,

            /* 验证手机号 */
            "tel": /^1(3|4|5|6|7|8|9)\d{9}$/,
            //验证邮编
            "post_code": /^[0-9][0-9]{5}$/,
            //验证车牌号
            "licenseNo": /^(([\u4e00-\u9fa5]{1}[A-Z]{1})[-]?|([wW][Jj][\u4e00-\u9fa5]{1}[-]?)|([a-zA-Z]{2}))([A-Za-z0-9]{5}|[DdFf][A-HJ-NP-Za-hj-np-z0-9][0-9]{4}|[0-9]{5}[DdFf])$/,

            /* 验证身份证号 */
            "IDCARD": /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,

            /* 是否全中文 */
            "allChinese": /[\u4E00-\u9FFF]+$/,

            /* 是否全英文 */
            "allEnglish": /^[a-zA-Z]+$/
        };

        this.getValidation = function (str, key) {
            var reg = new RegExp(regMap[key]);

            if (key === "IDCARD") {
                return this.IdCardValidate(str);
            } else {
                return reg.test(str);
            }
        };

        // 返回 微信页面 attch 里面的参数
        this.wxAttchParam = function () {
            var attch = this.getUrlParam("attch");
            if (!attch) {
                return;
            }

            var attchArr = attch.split(",");
            var param = {};

            for (var i = 0; i < attchArr.length; i++) {
                var str = attchArr[i];
                var strArr = str.split(":");
                param[strArr[0]] = strArr[1];
            }

            console.log("地址参数为 -> ", param);
            return param;
        };
        this.getUrlParam = function (key) {
            var urlParam = $location.search();
            return key ? urlParam[key] : urlParam;
        };

        // 返回操作系统 安卓 | IOS
        this.getUserAgent = function () {
            var u = navigator.userAgent;

            //android 终端
            if (u.indexOf('Android') > -1 || u.indexOf('Adr') > -1) {
                return "isAndroid";
            }

            //ios终端
            if (!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
                return "isIOS";
            }

            return "isOther";
        };

        // 身份证 强验证
        this.IdCardValidate = function (idCard) {
            // 去掉字符串头尾空格
            idCard = this.trim(idCard.replace(/ /g, ""));

            // 进行15位身份证的验证
            if (idCard.length === 15) {
                return this.isValidityBrithBy15IdCard(idCard);
            } else if (idCard.length === 18) {
                // 得到身份证数组
                var a_idCard = idCard.split("");

                // 进行18位身份证的基本验证和第18位的验证
                return (this.isValidityBrithBy18IdCard(idCard) && this.isTrueValidateCodeBy18IdCard(a_idCard));
            } else {
                return false;
            }
        };

        /**
         * 判断身份证号码为18位时最后的验证位是否正确
         * @param a_idCard 身份证号码数组
         * @return
         */
        this.isTrueValidateCodeBy18IdCard = function (a_idCard) {
            // 加权因子
            var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];

            // 身份证验证位值 .10 代表 X
            var ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];

            // 声明加权求和变量
            var sum = 0;
            if (a_idCard[17].toLowerCase() == "x") {
                // 将最后位为 x 的验证码替换为 10 方便后续操作
                a_idCard[17] = 10;
            }

            // 加权求和
            for (var i = 0; i < 17; i++) {
                sum += Wi[i] * a_idCard[i];
            }

            // 得到验证码所位置
            var valCodePosition = sum % 11;
            return (a_idCard[17] == ValideCode[valCodePosition]);
        };

        /**
         * 验证 18 位数身份证号码中的生日是否是有效生日
         * @param idCard 18 位书身份证字符串
         * @return
         */
        this.isValidityBrithBy18IdCard = function (idCard18) {
            var year = idCard18.substring(6, 10);
            var month = idCard18.substring(10, 12);
            var day = idCard18.substring(12, 14);
            var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));

            // 这里用 getFullYear() 获取年份，避免千年虫问题
            if (temp_date.getFullYear() != parseFloat(year)
                || temp_date.getMonth() != parseFloat(month) - 1
                || temp_date.getDate() != parseFloat(day)) {
                return false;
            } else {
                return true;
            }
        };

        /**
         * 验证 15 位数身份证号码中的生日是否是有效生日
         * @param idCard15 15位书身份证字符串
         * @return
         */
        this.isValidityBrithBy15IdCard = function (idCard15) {
            var year = idCard15.substring(6, 8);
            var month = idCard15.substring(8, 10);
            var day = idCard15.substring(10, 12);
            var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));

            // 对于老身份证中的年龄则不需考虑千年虫问题而使用 getYear() 方法
            if (temp_date.getYear() != parseFloat(year)
                || temp_date.getMonth() != parseFloat(month) - 1
                || temp_date.getDate() != parseFloat(day)) {
                return false;
            } else {
                return true;
            }
        };

        //去掉字符串头尾空格
        this.trim = function (str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        };

        // 返回身份证信息 如 性别 sex、生日 birthDay 年龄age
        this.getIDCardInfo = function (id) {
            var obj = {};

            // 身份证号 获取性别
            var sexNum = id.substring(id.length - 2, id.length - 1);
            var isEven = (sexNum % 2) === 0;
            obj["sex"] = isEven ? "2" : "1";       // 姓别 1 -> 男 | 2 -> 女

            // 身份证号 获取生日
            var birthDay = id.substring(6, 14);
            var y = birthDay.substring(0, 4);
            var m = birthDay.substring(4, 6);
            var d = birthDay.substring(6, 8);
            obj["birthDay"] = y + "-" + m + "-" + d;

            // 身份证号 获取年龄
            var nowDate = new Date();
            var intYear = parseInt(y);
            var month = nowDate.getMonth() + 1;
            var intMonth = parseInt(m);
            var day = nowDate.getDate();
            var age = nowDate.getFullYear() - intYear - 1;
            age = parseInt(age);
            if (intMonth < month || (intMonth === month && id.substring(12, 14) <= day)) {
                age++;
            }
            obj["age"] = age;

            // 判断基本信息
            if (parseInt(y) <= 0 || parseInt(m) <= 0 || parseInt(d) <= 0 || parseInt(d) > 31 || age > 110) {
                alert("请检查身份证号");
                return false;
            }

            return obj;
        };

        //注册正则验证
        this.verify = function (userData, isCode, alt) {
            if (!userData.phoneNb) {
                alt("请输入 您的手机号码");
                return false;
            }
            if (!this.getValidation(userData.phoneNb, "tel")) {
                alt("请检查 手机号格式是否正确");
                return false;
            }
            if (!isCode && userData.anewGet == "") {
                alt("请先获取 验证码");
                return false;
            }
            if (!isCode && userData.anewGet == true) {
                alt("验证码失效 请重新获取");
                return false;
            }
            if (!userData.yzCode) {
                alt("请输入 验证码");
                return false;
            }
            if (userData.yzCode.length != 4) {
                alt("请输入四位验证码");
                return false
            }
            if (/[\u4E00-\u9FA5]/g.test(userData.yzCode)) {
                alt("验证码不能含有汉字！");
                return false
            }
            if ((userData.yzCode).toLowerCase() != (userData.backCode).toLowerCase()) {
                alt("请输入正确的验证码");
                return false
            }
            return true;
        };

        //立即抽奖 正则验证
        this.verify_s = function (userData, isCode, alt) {
            var reg1 = /^[\u0391-\uFFE5]+$/;  // 中文正则
            var reg2 = /^[A-Za-z]+$/;          // 英文正则
            var reg3 = /^[0-9]+$/;          // 英文正则
            if (!userData.name) {
                alt("请输入 您的姓名");
                return false
            }
            if (!(reg1.test(userData.name) || reg2.test(userData.name))) {
                alt("姓名中只能全部是 汉字 或 英文");
                return false;
            }
            // 喜马拉雅的活动 身份证号和车牌号不是必录的 暂时去掉校验
            // if (!userData.idCard) {
            //     alt("请输入 您的身份证号");
            //     return false
            // }
            // if (!this.getValidation(userData.idCard, "IDCARD")) {
            //     alt("请检查 身份证号码是否正确");
            //     return false;
            // }
            // if (userData.carNub) {
            //     if (!this.getValidation(userData.carNub, "licenseNo")) {
            //         alt("请检查 车牌号是否正确");
            //         return false;
            //     }
            // }
            if (!userData.phoneNb) {
                alt("请输入 您的手机号码");
                return false;
            }
            if (!this.getValidation(userData.phoneNb, "tel")) {
                alt("请检查 手机号格式是否正确");
                return false;
            }
            if (!isCode && userData.anewGet == "") {
                alt("请先获取 验证码");
                return false;
            }
            if (!isCode && userData.anewGet == true) {
                alt("验证码失效 请重新获取");
                return false;
            }
            if (!userData.yzCode) {
                alt("请输入 验证码");
                return false;
            }
            if (userData.yzCode.length != 4) {
                alt("请输入四位验证码");
                return false
            }
            if (/[\u4E00-\u9FA5]/g.test(userData.yzCode)) {
                alt("验证码不能含有汉字！");
                return false
            }
            //if((userData.yzCode).toLowerCase()!=(userData.backCode).toLowerCase()){
            //    alt("请输入正确的验证码");
            //    return false
            //}
            //if(!userData.address){
            //    alt("请输入 您的地址");
            //    return false;
            //}
            //if(!userData.company){
            //    alt("请输入 您的所属公司");
            //    return false;
            //}
            return true;
        }
    }
]);
