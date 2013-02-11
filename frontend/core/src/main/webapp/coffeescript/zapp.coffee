"use strict"

# Kludge: "z" in the file name is because Wro4j compiles coffeescript
# files in alphabetical order and this needs to be the last file.

angular
  .module( 'em', ['em.filters', 'em.services', 'em.directives'])
  .config(
    # Use this at some point: http://docs.angularjs.org/guide/dev_guide.services.$location
    # History API support required: http://caniuse.com/#search=history
    #
    #['$locationProvider', ($locationProvider) ->
    #  $locationProvider.html5Mode(true)],
    ['$routeProvider', ($routeProvider)->
      $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: ContentCtrl})
      $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: AboutCtrl})
      $routeProvider.when('/people', {templateUrl: 'partials/people.html', controller: PeopleCtrl})
      $routeProvider.when('/people/:personId', {templateUrl: 'partials/person.html', controller: PersonCtrl})
      $routeProvider.when('/categories', {templateUrl: 'partials/categories.html', controller: CategoriesCtrl})
      $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: LoginCtrl})
      $routeProvider.when('/my', {templateUrl: 'partials/my.html', controller: MyCtrl})
      $routeProvider.otherwise({redirectTo: '/'})]
  )

angular.bootstrap(document,['em'])