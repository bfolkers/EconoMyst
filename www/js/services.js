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

.factory('followStockService', () => {
  return {
    follow: function(ticker) {

    },

    unfollow: function(ticker) {

    },

    checkFollowing: function(ticker) {

    }
  };
})

.factory('stockDataService', function($q, $http) {
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
    var url = "http://marketdata.websol.barchart.com/getQuote.json?key=16d4f4b5d562d5fdb21390e52afaeba2&symbols=" + ticker + "&fields=ask%2Cbid%2CfiftyTwoWkHigh%2CfiftyTwoWkLow%2CavgVolume%2CpreviousClose&mode=R";

    $http.get(url)
      .then(function(json) {
        var jsonData = json.data.results[0];
        deferred.resolve(jsonData);
      })
      .catch(function(err) {
        console.log("Stock data error" + err);
        deferred.reject();
      });

      return deferred.promise;
  };
  return {
    getPriceData: getPriceData
    // ,getDetailsData: getDetailsData
  };

})

// .factory('chartDataService', function($q, $http, encodeURIService) {
//   var getHistoricalData = function(ticker, fromDate, todayDate) {
//     var deferred = $q.defer();
//     var url = 'http://marketdata.websol.barchart.com/getHistory.json?key=16d4f4b5d562d5fdb21390e52afaeba2&symbol=' + ticker + '&type=daily&startDate=' + fromDate + '&endDate=' + todayDate;
//
//     $http.get(url)
//       .then(function(json) {
//         var jsonData = json.data.results;
//
//         var priceData = [];
//         var volumeData = [];
//
//         jsonData.forEach(function(dayDataObject) {
//           // console.log(dayDataObject);
//           var dateToMillis = dayDataObject.timestamp;
//           var date = Date.parse(dateToMillis);
//           var price = parseFloat(Math.round(dayDataObject.close * 100) / 100).toFixed(2);
//           var volume = dayDataObject.volume;
//           var volumeDatum = '[' + date + ',' + volume + ']';
//           var priceDatum = '[' + date + ',' + price + ']';
//
//           // console.log(volumeDatum, priceDatum);
//
//           volumeData.unshift(volumeDatum);
//           priceData.unshift(priceDatum);
//         });
//
//         var formattedChartData =
//         '[{' +
//           '"key":' + '"volume",' +
//           '"bar":' + 'true,' +
//           '"values":' + '[' + volumeData + ']' +
//         '},' +
//         '{' +
//           '"key":' + '"' + ticker + '",' +
//           '"values":' + '[' + priceData + ']' +
//         '}]';
//
//         deferred.resolve(formattedChartData);
//       })
//       .catch(function(error) {
//         console.log("Chart data error: " + error);
//         deferred.reject();
//       });
//
//       return deferred.promise;
//
//   };
//
//   return {
//     getHistoricalData: getHistoricalData
//   };
// })

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
