angular.module('economyst.controllers', [])

.controller('AppCtrl', ['$scope', 'modalService', 'userService',
  function($scope, modalService, userService) {
    $scope.modalService = modalService;
    $scope.logout = function() {
      userService.logout();
    };
}])

.controller('MyStocksCtrl', ['$scope', 'myStocksArrayService',
  function($scope, myStocksArrayService) {
    $scope.myStocksArray = myStocksArrayService;
  }
])

.controller('StockCtrl', ['$scope', '$stateParams', '$window', 'followStockService', 'stockDataService', 'newsService', '$cordovaInAppBrowser',
  function($scope, $stateParams, $window, followStockService, stockDataService, newsService, $cordovaInAppBrowser) {
    $scope.ticker = $stateParams.stockTicker;
    $scope.following = followStockService.checkFollowing($scope.ticker);

    $scope.$on("$ionicView.afterEnter", function() {
      getPriceData();
      getNews();
    });

    $scope.toggleFollow = function() {
      if ($scope.following) {
        followStockService.unfollow($scope.ticker);
        $scope.following = false;
      } else {
        followStockService.follow($scope.ticker);
        $scope.following = true;
      }
    };

    $scope.openWindow = function(link) {
      var inAppBrowserOptions = {
        location: 'yes',
        clearcache: 'yes',
        toolbar: 'yes'
      };
      $cordovaInAppBrowser.open(link, '_blank', inAppBrowserOptions);
    };

    function getNews() {
      $scope.newsStories = [];
      var promise = newsService.getNews($scope.ticker);
      promise
        .then(function(data) {
          $scope.newsStories = data;
        });
    }

    function getPriceData() {
      var promise = stockDataService.getPriceData($scope.ticker);
      promise
        .then(function(data) {
          $scope.stockPriceData = data;
        });
    }
}])

.controller('SearchCtrl', ['$scope', '$state', 'modalService', 'searchService',
  function($scope, $state, modalService, searchService) {
    $scope.closeModal = function() {
      modalService.closeModal();
    };

    $scope.search = function() {
      $scope.searchResults = '';
      startSearch($scope.searchQuery);
    };

    var startSearch = ionic.debounce(function(query) {
      searchService.search(query)
        .then(function(data) {
          $scope.searchResults = data;
        });
    }, 750);

    $scope.goToStock = function(ticker) {
      modalService.closeModal();
      $state.go('app.stock', {stockTicker: ticker});
    };
}])

.controller('LoginSignupCtrl', ['$scope', 'modalService', 'userService',
  function($scope, modalService, userService) {

    $scope.closeModal = function() {
      modalService.closeModal();
    };

    $scope.signup = function(user) {
      userService.signup(user);
    };

    $scope.login = function(user) {
      userService.login(user);
    };
  }])

;
