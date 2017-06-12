angular.module('economyst.services', [])

// .factory('encodeURIService', function() {
//
//   return {
//     encode: function(string) {
//       return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g, "");
//     }
//   };
// })
//
// .factory('dateService', function($filter) {
//   var currentDate = function() {
//     var d = new Date();
//     var date = $filter('date')(d, 'yyyy-MM-dd');
//     return date;
//   };
//
//   var oneYearAgoDate = function() {
//     var d = new Date(new Date().setDate(new Date().getDate() - 365));
//     var date = $filter('date')(d, 'yyyy-MM-dd');
//     return date;
//   };
// })

.service('modalService', function($ionicModal) {

  this.openModal = function(id) {
    var _this = this;
    if (id == 1) {
      $ionicModal.fromTemplateUrl('templates/search.html', {
        scope: null,
        controller: 'SearchCtrl'
      }).then(function(modal) {
        _this.modal = modal;
        _this.modal.show();
      });
    } else if (id == 2) {

    }

    // $ionicModal.fromTemplateUrl('templates/login.html', {
    //   scope: $scope
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });
    // $ionicModal.fromTemplateUrl('templates/login.html', {
    //   scope: $scope
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });
  };

  this.closeModal = function() {
    var _this = this;
  };
})

.factory('fillMyStocksCacheService', function(CacheFactory) {

  var myStocksCache;
  if (!CacheFactory.get('myStocksCache')) {
    myStocksCache = CacheFactory('myStocksCache', {
      storageMode: 'localStorage'
    });
  } else {
    myStocksCache = CacheFactory.get('myStocksCache');
  }

  var fillMyStocksCache = function() {
    var myStocksArray = [
      {ticker: "AAPL"},
      {ticker: "GPRO"},
      {ticker: "FB"},
      {ticker: "NFLX"},
      {ticker: "TSLA"},
      {ticker: "INTC"},
      {ticker: "MSFT"},
      {ticker: "GE"},
      {ticker: "BAC"},
      {ticker: "C"},
      {ticker: "T"},
      {ticker: "ACN"}
    ];
    myStocksCache.put('myStocks', myStocksArray);
  };

  return {
    fillMyStocksCache: fillMyStocksCache
  };
})

.factory('myStocksCacheService', function(CacheFactory) {
  var myStocksCache = CacheFactory.get('myStocksCache');
  return myStocksCache;
})

.factory('myStocksArrayService', function(fillMyStocksCacheService, myStocksCacheService) {

  if (!myStocksCacheService.info('myStocks')) {
    fillMyStocksCacheService.fillMyStocksCache();
  }
  var myStocks = myStocksCacheService.get('myStocks');
  return myStocks;
})

.factory('followStockService', function(myStocksArrayService, myStocksCacheService) {
  return {
    follow: function(ticker) {
      var stockToAdd = {
        "ticker": ticker
      };
      myStocksArrayService.push(stockToAdd);
      myStocksCacheService.put('myStocks', myStocksArrayService);
    },

    unfollow: function(ticker) {
      for (var i = 0; i < myStocksArrayService.length; i++) {
        if (myStocksArrayService[i].ticker == ticker) {
          myStocksArrayService.splice(i, 1);
          myStocksCacheService.remove('myStocks');
          myStocksCacheService.put('myStocks', myStocksArrayService);
          break;
        }
      }
    },

    checkFollowing: function(ticker) {
      for (var i = 0; i < myStocksArrayService.length; i++) {
        if (myStocksArrayService[i].ticker == ticker) {
          return true;
        }
      }
      return false;
    }
  };
})

.factory('stockDataService', function($q, $http, stockDetailsCacheService) {
  // var getDetailsData = function(ticker) {
  //   var deferred = $q.defer();
  //   var url = "http://marketdata.websol.barchart.com/getQuote.json?key=16d4f4b5d562d5fdb21390e52afaeba2&symbols=" + ticker.toString();
  //
  //   $http.get(url)
  //     .then(function(json) {
  //       // var jsonData = json.data.results[0];
  //       // deferred.resolve(jsonData);
  //     })
  //     .catch(function(err) {
  //       console.log("Details data error" + err);
  //       deferred.reject();
  //     });
  //
  //     return deferred.promise;
  // };

  var getPriceData = function(ticker) {
    var deferred = $q.defer();

    var cacheKey = ticker;
    var stockDetailsCache = stockDetailsCacheService.get(cacheKey);

    var url = "http://marketdata.websol.barchart.com/getQuote.json?key=16d4f4b5d562d5fdb21390e52afaeba2&symbols=" + ticker + "&fields=ask%2Cbid%2CfiftyTwoWkHigh%2CfiftyTwoWkLow%2CavgVolume%2CpreviousClose&mode=R";

    if (stockDetailsCache) {
      deferred.resolve(stockDetailsCache);
    } else {
      $http.get(url)
        .then(function(json) {
          var jsonData = json.data.results[0];
          deferred.resolve(jsonData);
          stockDetailsCacheService.put(cacheKey, jsonData);
        })
        .catch(function(err) {
          console.log("Stock data error" + err);
          deferred.reject();
        });
    }
      return deferred.promise;
  };
  return {
    getPriceData: getPriceData
    // ,getDetailsData: getDetailsData
  };

})

// .factory('chartDataService', function($q, $http, encodeURIService, chartDataCacheService) {
//   var getHistoricalData = function(ticker, fromDate, todayDate) {
//     var deferred = $q.defer();
//
//     var cacheKey = ticker;
//     var chartDataCache = chartDataCacheService.get(cacheKey);
//
//     var url = 'http://marketdata.websol.barchart.com/getHistory.json?key=16d4f4b5d562d5fdb21390e52afaeba2&symbol=' + ticker + '&type=daily&startDate=' + fromDate + '&endDate=' + todayDate;
//
//     if (chartDataCache) {
//       deferred.resolve(chartDataCache);
//     } else {
//       $http.get(url)
//         .then(function(json) {
//           var jsonData = json.data.results;
//
//           var priceData = [];
//           var volumeData = [];
//
//           jsonData.forEach(function(dayDataObject) {
//             // console.log(dayDataObject);
//             var dateToMillis = dayDataObject.timestamp;
//             var date = Date.parse(dateToMillis);
//             var price = parseFloat(Math.round(dayDataObject.close * 100) / 100).toFixed(2);
//             var volume = dayDataObject.volume;
//             var volumeDatum = '[' + date + ',' + volume + ']';
//             var priceDatum = '[' + date + ',' + price + ']';
//
//             // console.log(volumeDatum, priceDatum);
//
//             volumeData.unshift(volumeDatum);
//             priceData.unshift(priceDatum);
//           });
//
//           var formattedChartData =
//           '[{' +
//             '"key":' + '"volume",' +
//             '"bar":' + 'true,' +
//             '"values":' + '[' + volumeData + ']' +
//           '},' +
//           '{' +
//             '"key":' + '"' + ticker + '",' +
//             '"values":' + '[' + priceData + ']' +
//           '}]';
//
//           deferred.resolve(formattedChartData);
//           chartDataCacheService.put(cacheKey, formattedChartData);
//         })
//         .catch(function(error) {
//           console.log("Chart data error: " + error);
//           deferred.reject();
//         });
//     }
//       return deferred.promise;
//
//   };
//
//   return {
//     getHistoricalData: getHistoricalData
//   };
// })

// .factory('chartDataCacheService', function(CacheFactory) {
//   var chartDataCache;
//
//   if (!CacheFactory.get('chartDataCache')) {
//     chartDataCache = CacheFactory('chartDataCache', {
//       maxAge: 60 * 60 * 8 * 1000,
//       deleteOnExpire: 'aggressive',
//       storageMode: 'localStorage'
//     });
//   } else {
//     chartDataCache = CacheFactory.get('chartDataCache');
//   }
//
//   return chartDataCache;
// })

.factory('stockDetailsCacheService', function(CacheFactory) {

  var stockDetailsCache;

  if(!CacheFactory.get('stockDetailsCache')) {
    stockDetailsCache = CacheFactory('stockDetailsCache', {
      maxAge: 60 * 1000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage'
    });
  }
  else {
    stockDetailsCache = CacheFactory.get('stockDetailsCache');
  }

  return stockDetailsCache;
})

.factory('newsService', function($q, $http) {
  return {
    getNews: function(ticker) {
      var deferred = $q.defer();
      var x2js = new X2JS();
      var url = "http://finance.yahoo.com/rss/headline?s=" + ticker;

      $http.get(url)
        .success(function(xml) {
          var xmlDoc = x2js.parseXmlString(xml);
          var json = x2js.xml2json(xmlDoc);
          var jsonData = json.rss.channel.item;
          deferred.resolve(jsonData);
        })
        .error(function(error) {
          deferred.reject();
          console.log("RSS feed error: " + error);
        });

      return deferred.promise;
    }
  };
})

;
