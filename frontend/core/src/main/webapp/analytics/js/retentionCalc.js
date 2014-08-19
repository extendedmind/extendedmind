function checkRetention(date, days) {
    console.log("days left to count:" + days);
    if (days > 0) {
        startRetention(date, days);
    }
}

function startRetention(date, days) {
	var dailyUUID = [];
    var dailyPackaging = [];
    var dailyVersions = [];

    var endDate = new Date(); 
    endDate.setDate(date.getDate() + 1);
    /* 
    Fetch all signups for a single day
    https://ext.md/evaluate/1.0/event?expression=signUp(user.uuid)&start=2014-08-5&stop=2014-08-06&step=864e5
    */
    var startDay = dateToString(date);
    var endDay = dateToString(endDate);

    var baseUrl = "https://ext.md/evaluate/1.0/event?expression="; 
    var query = baseUrl + "signUp(user.uuid,version,packaging)&step=864e5&start=" + startDay + "&stop=" + endDay;
    var example = "data/signup_uuid.json";

    // Process signups 
    $.getJSON( query, function( data ) {
        var items = [];
        $.each( data, function( key, val ) {
            // console.log(key,val);
            var dateobj = new Date(val.time);
            var uuid = val.data.user.uuid;
            var packaging = val.data.packaging;
            var version = val.data.version;

            dailyUUID.push(uuid);
            dailyPackaging.push(packaging);
            dailyVersions.push(version);
        });

        // remove duplicates from packaging and versions arrays
        var uniquePackaging = [];
        var uniqueVersions = [];
        $.each(dailyPackaging, function(i, el){
            if($.inArray(el, uniquePackaging) === -1) uniquePackaging.push(el);
        });
        $.each(dailyVersions, function(i, el){
            if($.inArray(el, uniqueVersions) === -1) uniqueVersions.push(el);
        });

        continueRetention(dailyUUID,date, days, uniquePackaging, uniqueVersions);
    });
}

function continueRetention(uuids, date, days, packaging, versions) {
	/* 
    Fetch all distinct sessions per day
    https://ext.md/evaluate/1.0/metric/get?expression=distinct(session.in(user.uuid,[%229721068b-7850-44e1-b951-68efe5bea9ab%22,%22cde2222c-f092-485b-96dd-4221f8d13054%22,%225b269b37-80e9-495b-a641-081b73b6884b%22,%22dca7bc8a-102c-436a-bd6d-3288a270d94f%22]))&start=2014-08-05&stop=2014-08-18&step=864e5
    */
    var uuidsString = "'" + uuids.join("','") + "'";
    var packagingString = packaging.join();
    var versionsString = versions.join();

    var endDate = new Date(); 
    endDate.setDate(date.getDate() + 32);

    var startDay = dateToString(date);
    var endDay = dateToString(endDate);

    var baseUrl = "https://ext.md/evaluate/1.0/metric/get?expression="; 
    var query = baseUrl + "distinct(session.in(user.uuid,["+uuidsString+"]))&step=864e5&start=" + startDay + "&stop=" + endDay;
    var example = "data/sessions_uuids.json";

    // for day-diff calculation
    var today = new Date();
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var daysBetween = Math.round(Math.abs((today.getTime() - date.getTime())/(oneDay)));

    if (uuids.length > 0) {

        // Json processing 
        $.getJSON( query, function( data ) {

            console.log(data);

            var signups = uuids.length;
            var dateString = date.toDateString();
            var d1,d7,d30;

            if (data.length > 0) {
                if (daysBetween > 0) {
                    d1 = ((data[1].value / signups) * 100).toFixed(2) + "%";
                } else {
                    d1 = "-";
                }
            } else {
            	d1 = "no data";
            }

            if (data.length > 6) {
                if (daysBetween > 7) {
                    d7 = ((data[7].value / signups) * 100).toFixed(2) + "%";
                } else {
                    d7 = "-";
                }
            } else {
                d7 = "no data";
            }

            if (data.length >29) {
                if (daysBetween > 30) {
                    d30 = ((data[30].value / signups) * 100).toFixed(2) + "%";
                } else {
                    d30 = "-";
                }
            } else {
                d30 = "no data";
            }

            $('#retention').append( '<tr><td>' + dateString + '</td><td>' + signups + '</td><td>' + packagingString + '</td><td>' + versionsString + '</td><td>' + d1 + '</td><td>' + d7 + '</td><td>' + d30 + '</td></tr>' );

            // one cycle complete --
            // go one day back and reduce one day to go
            date.setDate(date.getDate() - 1);
            days -= 1;
            checkRetention(date,days);
        });

    } else {

        // if there are no signups, eg uuids.length is 0. All retention is no data.
        var signups = uuids.length;
        var packagingString = "no users";
        var versionsString = "no users";

        var dateString = date.toDateString();
        var d1,d7,d30;
        d1 = "no users";
        d7 = "no users";
        d30 = "no users";


        $('#retention').append( '<tr><td>' + dateString + '</td><td>' + signups + '</td><td>' + packagingString + '</td><td>' + versionsString + '</td><td>' + d1 + '</td><td>' + d7 + '</td><td>' + d30 + '</td></tr>' );

        // one cycle complete --
        // go one day back and reduce one day to go
        date.setDate(date.getDate() - 1);
        days -= 1;
        checkRetention(date,days);

    }
}