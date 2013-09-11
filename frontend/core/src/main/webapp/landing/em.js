
$.fn.formToJSON = function() {
  var objectGraph = {};

  function add(objectGraph, name, value) {
    if (name.length == 1) {
      //if the array is now one element long, we're done
      objectGraph[name[0]] = value;
    } else {
      //else we've still got more than a single element of depth
      if (objectGraph[name[0]] == null) {
        //create the node if it doesn't yet exist
        objectGraph[name[0]] = {};
      }
      //recurse, chopping off the first array element
      add(objectGraph[name[0]], name.slice(1), value);
    }
  };

  //loop through all of the input/textarea elements of the form
  $(this).find('*').each(function() {
    //ignore the submit button
    if ($(this).is("input") && $(this).attr('name') != 'submit') {
      //split the dot notated names into arrays and pass along with the value
      add(objectGraph, $(this).attr('name').split('.'), $(this).val());
    }
  });
  return JSON.stringify(objectGraph);
};

$.ajaxSetup({
  contentType : "application/json; charset=utf-8",
  dataType : "json"
});

$(document).ready(function() {
  $('#input').click(function() {
    var send = $("#emailForm").formToJSON();
    $.ajax({
      url : "/api/invite/request",
      type : "POST",
      data : send,
      error : function(xhr, errors) {
        $('#result').html('<div class="alert">' + ((xhr.responseText.length > 17) && (xhr.responseText.length < 100) ? xhr.responseText.slice(0,-15) : 'An unrecognized error occured: ' + xhr.status) + '</div>');
      },
      success : function(data) {
        $('#result').html('<div class="alert">Thank you. You are now on the beta waiting list.</div>');
      }
    });
    return false;
  });
});
