(function () {

    var app = angular.module('myreddit', ['ionic', 'angularMoment', 'jobs.favoritesstore']);

    app.config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home', {
            url: '/home',
            templateUrl: 'templates/home.html'
        });

        $stateProvider.state('favorites', {
            url: '/favorites',
            templateUrl: 'templates/favorites.html'
        });

        $stateProvider.state('settings', {
            url: '/settings',
            templateUrl: 'templates/settings.html'
        });

        $urlRouterProvider.otherwise('/home');

    });


    app.controller('FavoritesCtrl', function ($http, $scope, FavoritesStore) {
          $scope.favorites = FavoritesStore.list();

            $scope.remove = function(noteId) {
                FavoritesStore.remove(noteId);
            };

    });


    app.factory('configService', function () {

      var params = angular.fromJson(window.localStorage['config'] || {page: 0, code:"PT", query:"*"});
  	  function persist() {
  	  	window.localStorage['config'] = angular.toJson(params);
  	  }

      return {
          params,
          saveConfig : function (){
            persist();
          }
      };

    });

    app.controller('JobsCtrl', function ($http, $scope, configService, FavoritesStore) {

        $scope.stories = [];
        $scope.params = configService.params;

        $scope.doSearch = function (text) {

            configService.params.page = 0;
            $scope.stories = [];
            loadStories(function (stories) {
                $scope.stories = $scope.stories.concat(stories);

                if($scope.stories.length > 0){
                  configService.saveConfig();
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            });

        };

        function loadStories(callback) {

              //$http.get('mock/jobs.json', {
                $http.get('http://api.geopera.com/jobs', {
                    params: configService.params
                })
                .success(function (response) {
                    var stories = [];
                    angular.forEach(response.jobs, function (job) {
                        if (!job.thumbnail || job.thumbnail === 'self' || job.thumbnail === 'default') {
                            job.thumbnail = 'http://a5.mzstatic.com/us/r30/Purple3/v4/fa/fe/fe/fafefe3d-9415-8c9c-2f76-5161d91d6dd1/icon175x175.png';
                        }
                        job.id = job.link;
                        job.date = new Date(job.insertDate);
                        stories.push(job);
                    });
                    callback(stories);
                });
        }

        var page = 0;

        $scope.getFavoriteIcon = function(favorite){
            if(FavoritesStore.get(favorite.id)){
                return 'ion-android-favorite';
            }else {
                return 'ion-android-favorite-outline';
            }
        }

        $scope.loadOlderStories = function () {
            if ($scope.stories.length > 0) {
                configService.params.page = page++;
            }
            loadStories(function (olderStories) {
                $scope.stories = $scope.stories.concat(olderStories);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };

       $scope.addToFavorites = function (favorite){
           if(FavoritesStore.get(favorite.id)){ FavoritesStore.remove(favorite.id);}
           else {FavoritesStore.create(favorite);}
       }


        $scope.openLink = function (url) {
            window.open(url, '_blank');
        };



    });


    app.run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.cordova && window.cordova.InAppBrowser) {
                window.open = window.cordova.InAppBrowser.open;
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });

}());
