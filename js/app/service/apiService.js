
app.service("apiService", [
    "$http", "$q",
    function ($http, $q) {

        var debug = "wxUAT"; //生产上为MAST

        var DEPLOYMENT  = {
            "URL_MAP": {
                "wxUAT"     :"http://www.51clm.com/hhcx/uat/"   //2018-5-24更改
                //"wxUAT"     :"http://10.2.66.149:8080/hhcx"   //2018-5-24更改
                // "MAST"     : https://weixin.ypic.cn/",      // 微信生产地址
            },

            "URL_DETAIL": {
                //"AUTO"      : "/sales/claimDataController.do?method=esData&esType="
                "AUTO"     : "/sales/priceDataController.do?method=esData&esType="
            }
        };

        var DATA_HREF = DEPLOYMENT.URL_MAP[debug];
        var URL_AUTO = DEPLOYMENT.URL_DETAIL.AUTO;

        // 2018-02-01 判断 如果不是 MAST 得多加一个路径
        if (debug !== "MAST") {
            URL_AUTO = "estar-pic-yr" + URL_AUTO;
        }

        var DATA_URL = DATA_HREF + URL_AUTO;

        this.getJson = function (obj) {
            obj["contentType"] = "application/json; charset=utf-8";
            obj["dataType"] = "jsonp";
            obj["method"] = obj.method ? obj.method : "POST";
            obj["timeout"] = 60000;     // 超时处理
            var url = "";
            if (debug !== "MAST") {   //生产上 写成 ==MAST
                url = obj.url;
                if (!url) {
                    alert("接口未找到");
                    return;
                }
                console.log("将要传给后台的 data 未加密 json 报文对象 -> ", obj["data"]);
                obj["data"] = JSON.stringify(obj.data);
                obj["headers"] = this.getToken(obj.url,obj.data);
                obj["data"] = this.getBase64(obj["data"]);
            }
            obj["url"] = DATA_URL + obj["url"];
            var deferred = $q.defer();
            $http(obj).then(function(json){         // 成功处理
                console.log("接口返回报文为：",json.data);
                deferred.resolve(json.data);
            }).catch(function(error) {              // 异常处理

            });
            return deferred.promise;
        };

        this.getSign = function (appId,timestamp,appSecret,username,msgBody) {
            var content = appId+timestamp+appSecret+username+msgBody;
            return md5(content).toUpperCase();
        };

        this.getBase64 = function (data) {
            return BASE64.encode(utf16to8(data));
        };

        //将报文数据按照asicii码排序
        this.asciiSort=function(data){
            var str =data.replace(/\s/g, "");
            var strArr=str.split("");
            var newArr=strArr.sort();
            return (newArr.join("")).replace(/\s/g, "");
        };

        this.getToken = function (esType,data) {
            var appId = esType;
            var appSecret = "65537";
            var timestamp = new Date().getTime();
            var msgBody = this.asciiSort(data);
            var username="hhwx";

            return {
                "userName":username,
                "timestamp": timestamp,
                "token": this.getSign(appId,timestamp,appSecret,username,msgBody)
            };
        };

        return false;
    }
]);

