app.controller("informationCtrl", [
    "$scope", "$timeout", "$interval", "$location", "$rootScope",
    "apiService", "informationService",
    function ($scope, $timeout, $interval, $location, $rootScope,
              apiService, informationService) {

        /*
         * 定义 页面参数
         */
        $scope.pageData = {
            // 顶部栏文字
            "title": "信息录入",
            "codeSrc": "", //关注二维码 地址
            "cmpName": "null", //所属 一级股东名称
            "wxAttchParam": informationService.wxAttchParam(), //获取 地址里面的参数
            // 领取喜马拉雅的用户信息
            "userInfo": {
                "name": "", // 姓名 *
                "phoneNb": "", // 手机号 *
                "yzCode": "", // 验证码 *
                "idCard": "", // 身份证号
                "company": "", // 单位 默认值 公航旅 下属单位需补全
                "carNub": "", // 车牌号
                "carModel": "",
                "address": "",
                "anewGet": ""   //是否获取到验证码
            },
            "show": {
                "footer": true,
                "loading": false,
                "isClient": false,
                "marked": false
            }
        };
        $scope.noSubmit = true;
        $scope.isHiddCode = true;

        //body背景颜色
        $scope.bodyColer = function () {
            var path = $location.path();
            if (path == "/CjIndex" || path == "/carNub") {
                return "background-color: #ECFACA;";
            }
            if (path == "/information") {
                return "background-color: #F6DB8A;";
            }
        };
        $scope.bgColor = function (key) {
            var path = $location.path();
            if (path == "/CjIndex" || path == "/carNub") {
                if (key == "title") {
                    return "background-color: #56c570;";
                }
                if (key == "ok") {
                    return "background-color: #97daa7;";
                }
            }
        };
        //弹出服务商信息
        $scope.serviceData = function () {
            $scope.serviceBox = true;
            $scope.alertHint("888");
        };
        //公共模态框函数
        $scope.alertHint = function (text) {
            if (text) {
                $scope.pageData.show.marked = true;
                $scope.hintLanguage = text;
                return
            }
            //if($scope.noSubmit && $scope.isSkip){
            //    $scope.draw();
            //    $scope.pageData.show.marked=false;
            //    return
            //}
            $scope.pageData.show.marked = false;
            $scope.serviceBox = false;
        };

        /* 跳转路由 */
        $scope.onLocation = function (url) {
            $location.path(url);
        };


        // 隐藏弹窗
        $scope.hideView = function (key) {
            $scope.pageData.show[key] = false;
        };

        //获取验证码
        var interval = "";
        $scope.second = "";
        $scope.noMsg = false;
        $scope.codeText = "获取验证码";

        $scope.getCode = function () {
            if ($scope.noMsg || $scope.noSubmit) {
                return
            }
            var phoneNo = $scope.pageData.userInfo.phoneNb;
            var reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
            if (!phoneNo) {
                $scope.alertHint("请输入手机号");
                return
            }
            if (!reg.test(phoneNo)) {
                $scope.alertHint("请输入正确手机号");
                return
            }
            $scope.pageData.show.loading = true;
            var data = {
                "data": {
                    "operationType": "11",
                    "phoneNo": phoneNo
                }
            };
            apiService.getJson({
                "url": "insuranceSendMessage",  //生产上是 wxsend
                "data": data
            }).then(function (success) {
                $scope.hideView("loading");
                if (success.success) {
                    if (success.obj) {
                        angular.element(".inputTel").attr("disabled", true);
                        $scope.pageData.userInfo.anewGet = "";
                        $scope.codeText = 120;
                        $scope.second = "s";
                        $scope.noMsg = true;
                        interval = $interval(function () {
                            if ($scope.codeText > 0) {
                                $scope.codeText--;
                            } else {
                                $interval.cancel(interval);
                                angular.element(".inputTel").attr("disabled", false);
                                $scope.codeText = "获取验证码";
                                $scope.noMsg = false;
                                $scope.pageData.userInfo.anewGet = true;
                                $scope.second = "";
                            }
                        }, 1000);
                        //$scope.pageData.userInfo.backCode=success.obj.smsId;
                    } else {
                        $scope.alertHint("返回success.obj数据为空")
                    }
                } else {
                    $scope.alertHint(success.msg);
                }
            });
        };

        //生成提交数据
        $scope.submitData = function (val) {
            var userData = $scope.pageData.userInfo;
            var attch = $scope.pageData.wxAttchParam;
            var _data = {
                "type": val, // 1.判断是否完善信息2：完善信息提交接口3：判断是否已经领取奖品4：判断是否参加过车检活动5：车检活动提交接口 需要和后台人员确认接口 TODO
                "phone": userData.phoneNb,
                "name": userData.name,
                "idCard": userData.idCard,
                "code": userData.yzCode,
                "activityFlag": attch.source, //活动标识
                "wxOpenId": $location.search()["OpenId"],
                "cmpUnits": attch.cmpUnits, //股东标识
                "carNum": userData.carNub,   //车牌号
                "brandModel": userData.carModel//车辆品牌型号
            };
            return _data;
        };
        //我要领取
        $scope.myGet = function () {
            if ($scope.noSubmit) {
                return
            }
            $scope.onLocation("/CjIndex");//跳到采集信息页面即可
        };

        //车牌号输入字母转大写
        $scope.inputCar = function () {
            $scope.pageData.userInfo.carNub = ($scope.pageData.userInfo.carNub).toUpperCase();
        };

        //提交 注册信息
        $scope.isSubmit = function () {
            if ($scope.noSubmit) {
                return
            }
            var userData = $scope.pageData.userInfo;
            var isCode = $scope.noMsg;
            var alt = $scope.alertHint;
            if (!informationService.verify(userData, isCode, alt)) {
                return;
            }
            //提交信息
            $scope.getUserMsg();
        };
        //立即领取
        $scope.promptlySubmit = function () {
            if ($scope.noSubmit) {
                return
            }
            var userData = $scope.pageData.userInfo;
            var alt = $scope.alertHint;
            var isCode = $scope.noMsg;
            if (!informationService.verify_s(userData, isCode, alt)) {
                return;
            }
            var data = $scope.submitData("2");
            $scope.pageData.show.loading = true;
            apiService.getJson({
                "url": "gfSharePerfect",
                "data": {"data": data}
            }).then(function (success) {
                $scope.pageData.show.loading = false;
                if (success.success) {
                    $scope.noSubmit = true;
                    //$scope.alertHint("提交信息成功");
                    //$timeout(function(){
                    //    WeixinJSBridge.call("closeWindow");
                    //},2500);
                    $scope.onLocation("/CjIndex"); // 跳到恭喜获奖页面 TODO
                    return;
                }
                $scope.alertHint(success.msg);
            });
        };

        // 判断是否已经领取奖品
        $scope.isGetPrize = function () {
            var data = $scope.submitData("3");
            $scope.pageData.show.loading = true;
            apiService.getJson({
                "url": "gfSharePerfect",
                "data": {"data": data}
            }).then(function (success) {
                $scope.pageData.show.loading = false;
                if (success.success) {
                    if (success.msg == "1") { //已抽奖
                        $scope.alertHint("您已参加此活动，感谢您的参与。");
                        $scope.noSubmit = true;
                        $timeout(function () {
                            WeixinJSBridge.call("closeWindow");
                        }, 3000);
                        return
                    }
                    //跳转抽奖页面
                    $scope.draw();
                    return;
                }
                $scope.alertHint(success.msg);
            });
        };

        //根据openId判断用户领没领取过
        $scope.statusType = function () {
            var path = $location.path();
            var getType = "";
            if (path == "/CjIndex" || path == "/information") {
                getType = "1";
            }
            if (path == "/carNub") {
                getType = "4";
            }
            var data = $scope.submitData(getType);
            $scope.pageData.show.loading = true;
            apiService.getJson({
                "url": "gfSharePerfect",
                "data": {"data": data}
            }).then(function (success) {
                $scope.pageData.show.loading = false;
                if (success.success) { //subStat 1 已经采集过第一个页面 2已录入没有抽奖次数  3 已经参加活动   4  第一个页面也没有采集信息(用户未领取)
                    if (!success.msg) {
                        alert("msg 返回状态为空");
                        return
                    }
                    //注册信息页面
                    if (path == "/CjIndex") {
                        if (success.msg == "1") { //注册信息 已经完善
                            //判断是否已经领取奖品
                            $scope.isGetPrize();
                            $scope.pageData.userInfo.phoneNb = success.obj.wxPhone;
                            $scope.noSubmit = true;
                            return
                        }
                        if (success.msg == "0") { //注册信息 未完善
                            $scope.noSubmit = false;
                            return
                        }
                        return
                    }
                    //免检活动宣传页面
                    if (path == "/information" || path == "/carNub") {
                        if (success.msg == "1") { //已参加活动
                            $scope.alertHint("您已参加此活动，感谢您的参与。");
                            $scope.noSubmit = true;
                            return
                        }
                        if (success.msg == "0") { //未参加
                            $scope.pageData.userInfo.name = success.obj.name;
                            $scope.pageData.userInfo.phoneNb = success.obj.wxPhone;
                            $scope.pageData.userInfo.carNub = success.obj.carNum;
                            $scope.noSubmit = false;
                            if (success.obj.carNum) {
                                angular.element("#carNub").attr("disabled", true);
                            }
                            return
                        }
                        return
                    }

                    $scope.noSubmit = false;
                    return
                }
                $scope.alertHint(success.msg)
            });
        };

        //进入页面先根据openid判断是否关注公众号
        $scope.isAttention = function () {
            var attch = $scope.pageData.wxAttchParam;      //已关注的 地址attch里会有这个参数
            if (!attch) {
                alert("对不起，地址参数有缺失！");
                return
            } else if (!attch.source || !attch.cmpUnits) {
                alert("对不起，地址参数有缺失！");
                return
            }
            //获取 地址参数判断属于哪个股东
            if (attch.cmpUnits) {
                switch (attch.cmpUnits) {
                    case  "01":
                        $scope.pageData.cmpName = "中国交建";
                        break;
                    case  "02":
                        $scope.pageData.cmpName = "中铁建投";
                        break;
                    case  "03":
                        $scope.pageData.cmpName = "名城地产";
                        break;
                    case  "04":
                        $scope.pageData.cmpName = "公航旅集团";
                        break;
                    case  "05":
                        $scope.pageData.cmpName = "兰石集团";
                        break;
                    case "06":
                        $scope.pageData.cmpName = "新区城投";
                        break;
                    case "07":
                        $scope.pageData.cmpName = "白银有色";
                        break;
                    case  "08":
                        $scope.pageData.cmpName = "远达集团";
                        break;
                    case  "09":
                        $scope.pageData.cmpName = "读者传媒";
                        break;
                    case  "001":
                        $scope.pageData.cmpName = "读者集团";
                        break;
                }
            }
            $scope.statusType();
        };

        //转大写方法
        $scope.toUppercase = function () {
            $scope.pageData.userInfo.idCard = ($scope.pageData.userInfo.idCard).toUpperCase();
        };

        /* 生命周期 */
        $rootScope.$on("$routeChangeSuccess", function () {
            //判断是否关注 和 状态信息
            $scope.isAttention();
        });
    }
]);
