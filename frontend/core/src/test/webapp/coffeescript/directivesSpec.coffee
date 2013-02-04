"use strict"

# jasmine specs for directives go here 
describe "directives", ->
  beforeEach module("em.directives")
  describe "app-version", ->
    it "should print current version", ->
      test = ($provide) -> 
        thisisafunction = $provide.value "version", "TEST_VER"
      module test
      inject ($compile, $rootScope) ->
        element = $compile("<span app-version></span>")($rootScope)
        expect(element.text()).toEqual "TEST_VER"