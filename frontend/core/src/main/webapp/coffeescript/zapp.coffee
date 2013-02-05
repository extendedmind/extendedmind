"use strict"

# Kludge: "z" in the file name is because Wro4j compiles coffeescript
# files in alphabetical order and this needs to be the last file.

angular
  .module( 'em', ['em.filters', 'em.services', 'em.directives'])
  .config( ['$routeProvider', ($routeProvider)->

      $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: MyCtrl1})
      $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: MyCtrl2})
      $routeProvider.otherwise({redirectTo: '/', templateUrl: 'partials/home.html'})
    ])

angular.bootstrap(document,['em'])