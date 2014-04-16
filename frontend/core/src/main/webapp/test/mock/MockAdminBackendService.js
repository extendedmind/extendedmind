'use strict';

function MockAdminBackendService($httpBackend, AdminService) {

  function mockGetStatistics(){
    $httpBackend.whenGET(AdminService.statisticsRegex).respond(function() {
      var statisticsResponse = getJSONFixture('statisticsResponse.json');
      return [200, statisticsResponse];
    });
  }

  function mockGetUsers(){
    $httpBackend.whenGET(AdminService.usersRegex).respond(function() {
      var usersResponse = getJSONFixture('usersResponse.json');
      return [200, usersResponse];
    });
  }

  function mockGetInvites(){
    $httpBackend.whenGET(AdminService.invitesRegex).respond(function() {
      var invitesResponse = getJSONFixture('invitesResponse.json');
      return [200, invitesResponse];
    });
  }

  function mockGetInviteRequests(){
    $httpBackend.whenGET(AdminService.inviteRequestsRegex).respond(function() {
      var inviteRequestsResponse = getJSONFixture('inviteRequestsResponse.json');
      return [200, inviteRequestsResponse];
    });
  }

  function mockAcceptInviteRequest(expectResponse){
    $httpBackend.whenPOST(AdminService.acceptInviteRequestRegex)
      .respond(function(method, url, data, headers) {
        var acceptInviteRequestResponse = getJSONFixture('acceptInviteRequestResponse.json');
        acceptInviteRequestResponse.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, acceptInviteRequestResponse);
      });
  }

  function mockDeleteInviteRequest(){
    $httpBackend.whenDELETE(AdminService.deleteInviteRequestRegex)
      .respond(function() {
        var deleteInviteRequestResponse = getJSONFixture('deleteInviteRequestResponse.json');
        return [200, deleteInviteRequestResponse];
      });
  }

  return {
    mockAdminBackend: function(expectResponse) {
      mockGetStatistics();
      mockGetUsers();
      mockGetInvites();
      mockGetInviteRequests();
      mockAcceptInviteRequest(expectResponse);
      mockDeleteInviteRequest();
    }
  };
}

MockAdminBackendService.$inject = ['$httpBackend', 'AdminService'];
angular.module('em.appTest').factory('MockAdminBackendService', MockAdminBackendService);
