
/* loading */
app.directive("popLoading", function () {

    return {
        restrict: "AE",
        templateUrl: "./pages/templates/pop/loading.html"
    }

});

//二维码
app.directive("twoCode", function () {

    return {
        restrict: "AE",
        templateUrl: "./pages/templates/pop/twoCode.html"
    }

});

//公共模态框弹层
app.directive("hintBox", function () {
    return {
        restrict: "AE",
        templateUrl: "./pages/templates/hintbox.html"
    }
});
