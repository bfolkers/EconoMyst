angular.module('economyst.services', [])

.factory('firebaseRef', function(firebase, $firebase, $firebaseObject) {
  var firebaseRef = firebase.database().ref();
  // this.data = $firebaseObject(firebaseRef);
  return firebaseRef;
})

.factory('userCacheService',function(CacheFactory){
    var userDataCache;

    if(!CacheFactory.get('userDataCache')){
      userDataCache=CacheFactory('userDataCache',{
        maxAge: 60*60*8*1000,
        deleteOnExpire: 'aggressive',
        storageMode:'localStorage'
      });
    }
    else {
      userDataCache=CacheFactory.get('userDataCache');
    }
  return userDataCache;
 })

.factory('userService', function($rootScope, firebase, $firebase, $firebaseObject, firebaseRef, modalService, userCacheService) {
  var login = function(user) {
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(function(authData) {
        $rootScope.currentUser = authData;
        console.log(authData);
        userCacheService.put(user.email, authData);
        modalService.closeModal();
        $timeout(function() {
          $window.location.reload(true);
        }, 400);
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  var signup = function(user) {
    firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(function(status) {
        login(user);
      })
      .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode, errorMessage);
      // ...
    });

  };

  var logout = function() {
    firebase.auth().signOut()
      .then(function() {
        $rootScope.currentUser = '';
        userCacheService.removeAll();
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  var getUser = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log(user);
        return user;
      } else {
        return null;
      }
    });
    // var user = firebase.auth().currentUser;
    //
    // if (user) {
    //   return user;
    // } else {
    //   return null;
    // }


  };

  if (getUser()) {
    $rootScope.currentUser = getUser();
  }

  return {
    login: login,
    signup: signup,
    logout: logout
  };
})

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
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: null,
        controller: 'LoginSearchCtrl',
      }).then(function(modal) {
        _this.modal = modal;
        _this.modal.show();
      });
    } else if (id == 3) {
      $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: null,
        controller: 'LoginSearchCtrl',
      }).then(function(modal) {
        _this.modal = modal;
        _this.modal.show();
      });
    }
  };

  this.closeModal = function() {
    var _this = this;
    if (!_this.modal) {
      return;
    }
    _this.modal.hide();
    _this.modal.remove();
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

  var getPriceData = function(ticker) {
    var deferred = $q.defer();

    var cacheKey = ticker;
    var stockDetailsCache = stockDetailsCacheService.get(cacheKey);

    var url = "https://galvanize-cors-proxy.herokuapp.com/http://marketdata.websol.barchart.com/getQuote.json?key=16d4f4b5d562d5fdb21390e52afaeba2&symbols=" + ticker + "&fields=ask%2Cbid%2CfiftyTwoWkHigh%2CfiftyTwoWkLow%2CavgVolume%2CpreviousClose&mode=R";

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
      var url = "https://galvanize-cors-proxy.herokuapp.com/http://finance.yahoo.com/rss/headline?s=" + ticker;

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

.factory('searchService', function($q, $http) {
    return {
      search: function(query) {
        var deferred = $q.defer();
        var url = 'https://galvanize-cors-proxy.herokuapp.com/http://dev.markitondemand.com/Api/v2/Lookup/json?input=' + query;

        $http.get(url)
          .then(function(data) {
            var jsonData = data.data;
            deferred.resolve(jsonData);
          })
          .catch(function(error) {
            console.log(error);
          });
        return deferred.promise;
      }
    };
  })
;
