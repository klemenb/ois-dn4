var WhoData = function() {}

WhoData.prototype.parseMeanSystolicBloodPressure = function(gender, data, successCallback) {
    var fact;

    if (gender == 'MALE') {
        fact = data.fact[1];
    } else {
        fact = data.fact[0];
    }

    var parts = fact.value.display.split(' ');

    successCallback(parts[0]);
};

WhoData.prototype.getMeanSystolicBloodPressure = function(gender, successCallback, errorCallback) {
    var object = this;

    // Original WHO API source: "http://apps.who.int/gho/athena/api/GHO/BP_06?filter=AGEGROUP:*;SEX:*;COUNTRY:-&format=json"
    // (cached locally for better performance)
    $.ajax({
        url: 'cache/who_mean_systolic_blood_pressure.json',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            object.parseMeanSystolicBloodPressure(gender, data, successCallback);
        },
        error: errorCallback
    });
};
