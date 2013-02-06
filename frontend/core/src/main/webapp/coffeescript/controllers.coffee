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


window.MyCtrl1 = () ->
  MyCtrl1.$inject = []

window.MyCtrl2 = () ->
  MyCtrl2.$inject = []

