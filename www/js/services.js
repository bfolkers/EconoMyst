angular.module('economyst.services', [])


.factory('stockDataService', function($q, $http) {
  var getDetailsData = function(ticker) {
    var deferred = $q.defer();
    var url = "http://marketdata.websol.barchart.com/getQuote.json?key=16d4f4b5d562d5fdb21390e52afaeba2&symbols=" + ticker.toString();

    $http.get(url)
      .then(function(json) {
        // var jsonData = json.data.results[0];
        // deferred.resolve(jsonData);
      })
      .catch(function(err) {
        console.log("Details data error" + err);
        deferred.reject();
      });

      return deferred.promise;
  };

  var getPriceData = function(ticker) {
    var deferred = $q.defer();
    var url = "http://marketdata.websol.barchart.com/getQuote.json?key=16d4f4b5d562d5fdb21390e52afaeba2&symbols=" + ticker + "&fields=ask%2Cbid%2CfiftyTwoWkHigh%2CfiftyTwoWkLow%2CavgVolume%2CpreviousClose&mode=R";

    $http.get(url)
      .then(function(json) {
        var jsonData = json.data.results[0];
        deferred.resolve(jsonData);
      })
      .catch(function(err) {
        console.log("Price data error" + err);
        deferred.reject();
      });

      return deferred.promise;
  };
  return {
    getPriceData: getPriceData,
    getDetailsData: getDetailsData
  };

})
;
