var app = angular.module("informationApp", ["ngRoute"]);

app.config([
    "$routeProvider",
    function ($routeProvider) {

        $routeProvider
            //宣传彩面
            .when("/information", {templateUrl: "./pages/information.html"})

            //完善信息页面
            //.when("/trafficZx", {templateUrl: "./pages/trafficZxPage.html"})
            .when("/CjIndex", {templateUrl: "./pages/trafficZxPage.html"})

            //参加免检活动页面
            .when("/carNub", {templateUrl: "./pages/CjIndex.html"})
            /* 其它 */
            .otherwise({redirectTo: "/CjIndex"});
    }
]);
