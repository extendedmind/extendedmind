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
      $routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: SearchCtrl})
      $routeProvider.when('/search/:searchString', {templateUrl: 'partials/search.html', controller: SearchCtrl})
      $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: LoginCtrl})
      $routeProvider.when('/my', {templateUrl: 'partials/my.html', controller: MyCtrl})

      # TEST VALUES FOR MOCKUP
      $routeProvider.when('/people/timo-tiuraniemi/on-philosophy-of-technology', {templateUrl: 'partials/test/tech.html', controller: NoteCtrl})
      $routeProvider.when('/people/henri-ylikotila/essential-firefox-keyboard-shortcuts', {templateUrl: 'partials/test/firefox.html', controller: NoteCtrl})
      $routeProvider.when('/people/antti-takalahti/avocado-pasta', {templateUrl: 'partials/test/pasta.html', controller: NoteCtrl})
      $routeProvider.when('/people/timo-tiuraniemi/notes-on-productivity', {templateUrl: 'partials/test/productivity.html', controller: NoteCtrl})
      $routeProvider.when('/people/lauri-jarvilehto/why-its-great-to-be-a-nerd', {templateUrl: 'partials/test/nerd.html', controller: NoteCtrl})
      $routeProvider.when('/people/timo-tiuraniemi/how-to-break-out-of-facebook', {templateUrl: 'partials/test/nofacebook.html', controller: NoteCtrl})

      $routeProvider.otherwise({redirectTo: '/'})]
  )

angular.bootstrap(document,['em'])