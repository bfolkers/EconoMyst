angular.module('economyst.controllers', [])

.controller('AppCtrl', ['$scope', 'modalService',
  function($scope, modalService) {
    $scope.modalService = modalService;
}])

.controller('MyStocksCtrl', ['$scope', 'myStocksArrayService',
  function($scope, myStocksArrayService) {
    $scope.myStocksArray = myStocksArrayService;
  }
])

.controller('StockCtrl', ['$scope', '$stateParams', '$window', 'followStockService', 'stockDataService', 'newsService',/* 'chartDataService', 'dateService',*/
  function($scope, $stateParams, $window, followStockService, stockDataService, newsService/*, chartDataService, dateService*/) {
    $scope.ticker = $stateParams.stockTicker;
    $scope.chartView = 4;
    $scope.oneYearAgoDate = '20160611';
    $scope.todayDate = '20170611';
    $scope.following = followStockService.checkFollowing($scope.ticker);

    $scope.$on("$ionicView.afterEnter", function() {
      getPriceData();
      getNews();
      // getDetailsData();
      // getChartData();
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
      console.log("openWindow " + link);
    };

    $scope.chartViewFunc = function(n) {
      $scope.chartView = n;
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

    // function getDetailsData() {
    //   var promise = stockDataService.getDetailsData($scope.ticker);
    //   promise
    //     .then(function(data) {
    //       console.log(data);
    //       $scope.stockDetailsData = data;
    //     });
    // }
    //
    // function getChartData() {
    //   var promise = chartDataService.getHistoricalData($scope.ticker, $scope.oneYearAgoDate, $scope.todayDate);
    //   promise
    //     .then(function(data) {
    //       $scope.myData = JSON.parse(data)
    //     	.map(function(series) {
    //     		series.values = series.values.map(function(d) { return {x: d[0], y: d[1] }; });
    //     		return series;
    //     	});
    //     });
    // }
  //
	// var xTickFormat = function(d) {
	// 	var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
	// 	if (dx > 0) {
  //     return d3.time.format("%b %d")(new Date(dx));
	// 	}
	// 	return null;
	// };
  //
  // var x2TickFormat = function(d) {
  //   var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
  //   return d3.time.format('%b %Y')(new Date(dx));
  // };
  //
  // var y1TickFormat = function(d) {
  //   return d3.format(',f')(d);
  // };
  //
  // var y2TickFormat = function(d) {
  //   return d3.format('s')(d);
  // };
  //
  // var y3TickFormat = function(d) {
  //   return d3.format(',.2s')(d);
  // };
  //
  // var y4TickFormat = function(d) {
  //   return d3.format(',.2s')(d);
  // };
  //
  // var xValueFunction = function(d, i) {
  //   return i;
  // };
  //
  // var marginBottom = ($window.innerWidth / 100) * 10;
  //
	// $scope.chartOptions = {
  //   chartType: 'linePlusBarWithFocusChart',
  //   data: 'myData',
  //   margin: {top: 15, right: 40, bottom: marginBottom, left: 70},
  //   interpolate: "cardinal",
  //   useInteractiveGuideline: false,
  //   yShowMaxMin: false,
  //   tooltips: false,
  //   showLegend: false,
  //   useVoronoi: false,
  //   xShowMaxMin: false,
  //   xValue: xValueFunction,
  //   xAxisTickFormat: xTickFormat,
  //   x2AxisTickFormat: x2TickFormat,
  //   y1AxisTickFormat: y1TickFormat,
  //   y2AxisTickFormat: y2TickFormat,
  //   y3AxisTickFormat: y3TickFormat,
  //   y4AxisTickFormat: y4TickFormat,
  //   transitionDuration: 500
	// };

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
;
