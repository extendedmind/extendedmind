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

window.LoginCtrl = ($scope, page) ->
  page.setSubTitle 'login'

window.MyCtrl = ($scope, page) ->
  page.setSubTitle 'my'

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

    ]
    $scope.supervisedCags = [
      title: 'technology'
      url: '/search/technology'
    ]
      
window.MyCtrl1 = () ->
  MyCtrl1.$inject = []

window.MyCtrl2 = () ->
  MyCtrl2.$inject = []

