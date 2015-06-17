function prepareCombination () {
    var dataUrl = window.location.origin + "/evaluate/1.0/metric?expression=sum(session.eq(user.type,2))&start=2014-05-1&stop=2014-07-23&step=864e5";

    combinedItems = [];
    combinations = 2;

    // combine data
    $.getJSON( "data/acceptInvite.json", function( data ) {
        var items = [];
        $.each( data, function( key, val ) {
            combineJsonData(key,val);
        });
        combinationComplete();
    });

    $.getJSON( "data/signup.json", function( data ) {
        var items = [];
        $.each( data, function( key, val ) {
            combineJsonData(key,val);
        });
        combinationComplete();
    });

}

function combinationComplete() {
    combinations -= 1;
    if (combinations == 0) {
        console.log("successfully combined");
        console.log(combinedItems);
        return true;
    } else {
        return false;
    }
}

function isCombined() {
    if (combinations == 1) {
        return true;
    } else {
        return false;
    }
}

// merges data from two json files into one json string
function combineJsonData (i, data) {
    if (isCombined) {
            // exists
            combinedItems[i].value += data.value;
    } else {
            // first run
            combinedItems[i] = data;
    }
}


function combinationComplete () {
    console.log(combinedItems);
}
