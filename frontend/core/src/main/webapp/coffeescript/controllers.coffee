"use strict"

#Controllers

window.MainCtrl = ($scope, page) ->
  $scope.page = page

window.ContentCtrl = ($scope, page) ->
  page.setSubTitle null

window.AboutCtrl = ($scope, page) ->
  page.setSubTitle 'about'

window.PeopleCtrl = ($scope, page) ->
  page.setSubTitle 'people'

window.CategoriesCtrl = ($scope, page) ->
  page.setSubTitle 'categories'

window.SearchCtrl = ($scope, $routeParams, page) ->
  page.setSubTitle 'search'
  if $routeParams.searchString?
    $scope.searchString = $routeParams.searchString.replace /-/, ' '

window.LoginCtrl = ($scope, page) ->
  page.setSubTitle 'login'

window.MyCtrl = ($scope, page) ->
  page.setSubTitle 'my'

window.NotesCtrl = ($scope, page) ->
  page.setSubTitle 'my notes'

window.TasksCtrl = ($scope, page) ->
  page.setSubTitle 'my tasks'

window.EmailCtrl = ($scope, page) ->
  page.setSubTitle 'my email'

window.NoteCtrl = ($scope, page) ->
  page.setSubTitle 'note'

window.PersonCtrl = ($scope, $routeParams, page) ->
  page.setSubTitle $routeParams.personId.replace /-/, ' '
  if $routeParams.personId == 'timo-tiuraniemi'
    $scope.notes = [
      title: 'On the philosophy of technology'
      url: '/people/timo-tiuraniemi/on-philosophy-of-technology'
      verified:
        supervisor: 'Lauri Jarvilehto'
        date: '2013-02-01'
      category:
        title: 'essay'
        url: '/categories#essay'
      cags:[
          title: 'technology' 
          url: '/search/technology'
        ,
          title: 'philosophy'
          url: '/search/philosophy'
      ]
     ,
      title: 'Notes on productivity'
      url: '/people/timo-tiuraniemi/notes-on-productivity'
      category:
        title: 'essay'
        url: '/categories#essay'
      verified:
        supervisor: 'Lauri Jarvilehto'
        date: '2013-02-02'
      cags:[
          title: 'productivity' 
          url: '/search/productivity'
        ,
          title: 'philosophy'
          url: '/search/gtd'
      ]
     ,
      title: 'How to break out of Facebook'
      url: '/people/timo-tiuraniemi/how-to-break-out-of-facebook'
      category:
        title: 'essay'
        url: '/categories#instruction'
    ]
    $scope.supervisedCags = [
      title: 'technology'
      url: '/search/technology'
    ]
  else if $routeParams.personId == 'lauri-jarvilehto'
    $scope.notes = [
      title: "Why it's great to be a nerd"
      url: '/people/lauri-jarvilehto/why-its-great-to-be-a-nerd'
    ]
    $scope.supervisedCags = [
      title: 'philosophy'
      url: '/search/philosophy'
    ]
  else if $routeParams.personId == 'henri-ylikotila'
    $scope.notes = [
      title: "Essential Firefox keyboard shortcuts"
      url: '/people/henri-ylikotila/essential-firefox-keyboard-shortcuts'
      category:
        title: 'instruction'
        url: '/categories#instruction'
      verified:
        supervisor: 'Timo Tiuraniemi'
        date: '2013-02-05'
      cags:[
          title: 'software' 
          url: '/search/software'
        ,
          title: 'shortcut'
          url: '/search/shortcut'
        ,
          title: 'firefox'
          url: '/search/firefox'
      ]
    ]
  else if $routeParams.personId == 'antti-takalahti'
    $scope.notes = [
      title: "Avocado pasta"
      url: '/people/antti-takalahti/avocado-pasta'
      category:
        title: 'instruction'
        url: '/categories#instruction'
      cags:[
          title: 'recipe' 
          url: '/search/recipe'
        ,
          title: 'italian cuisine'
          url: '/search/italian-cuisine'
        ,
          title: 'vegetarian'
          url: '/search/vegetarian'
      ]
    ] 

      
window.MyCtrl1 = () ->
  MyCtrl1.$inject = []

window.MyCtrl2 = () ->
  MyCtrl2.$inject = []

