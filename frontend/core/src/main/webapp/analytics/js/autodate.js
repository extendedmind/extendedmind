// automatic date setting
var today = new Date();
var startDate = new Date();
startDate.setMonth(startDate.getMonth() - 2);  // set a date to two months back. We have 60 days history view.

function dateToString (dateObj) {
    var dd = dateObj.getDate();
    var mm = dateObj.getMonth()+1; //January is 0!
    var yyyy = dateObj.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    var dateString = yyyy+'-'+mm+'-'+dd;
    return dateString;
}