
/* loading */
app.directive("popLoading", function () {

    return {
        restrict: "AE",
        templateUrl: "./pages/templates/pop/loading.html"
    }

});

//��ά��
app.directive("twoCode", function () {

    return {
        restrict: "AE",
        templateUrl: "./pages/templates/pop/twoCode.html"
    }

});

//����ģ̬�򵯲�
app.directive("hintBox", function () {
    return {
        restrict: "AE",
        templateUrl: "./pages/templates/hintbox.html"
    }
});
