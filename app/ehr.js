var Ehr = function() {
    this.apiUrl = 'https://rest.ehrscape.com/rest/v1';

    this.username = 'ois.seminar';
    this.password = 'ois4fri';

    this.sessionId = false;
};

Ehr.prototype.getSessionId = function() {
    var object = this;
    var url = this.apiUrl + '/session?username=' + encodeURIComponent(this.username) +
        '&password=' + encodeURIComponent(this.password);

    $.ajax({
        type: 'POST',
        url: url,
        success: function(data) {
            object.sessionId = data.sessionId;
        },
        dataType: 'json',
        async: false
    });
};

Ehr.prototype.defaultErrorCallback = function(data) {
    console.log('Error: ' + JSON.parse(data.responseText).userMessage);
};

Ehr.prototype.defaultSuccessCallback = function(data) {
    console.log('Success: ' + JSON.stringify(data));
};

Ehr.prototype.sendRequest = function(method, url, data, successCallback, errorCallback, async) {
    if (!this.sessionId) this.getSessionId();

    if (!errorCallback) errorCallback = this.defaultErrorCallback;
    if (!successCallback) successCallback = this.defaultSuccessCallback;

    $.ajax({
        headers: {"Ehr-Session": this.sessionId},
        contentType: 'application/json',
        data: method != 'GET' ? JSON.stringify(data) : '',
        type: method,
        url: this.apiUrl + url,
        success: successCallback,
        error: errorCallback,
        async: async,
        dataType: 'json'
    });
};

Ehr.prototype.createEhr = function(successCallback, errorCallback) {
    this.sendRequest('POST', '/ehr', null, successCallback, errorCallback, true);
};

Ehr.prototype.createDemographicEntry = function(data, successCallback, errorCallback) {
    this.sendRequest('POST', '/demographics/party', data, successCallback, errorCallback, true);
};

Ehr.prototype.createCompositionEntry = function(composition, params, successCallback, errorCallback) {
    this.sendRequest('POST', '/composition?' + $.param(params), composition, successCallback, errorCallback, false);
};

Ehr.prototype.createFullEhrRecord = function(data, successCallback, errorCallback) {
    var object = this;

    this.createEhr(function(ehrData) {
        data.partyAdditionalInfo = [{key: "ehrId", value: ehrData.ehrId}];

        object.createDemographicEntry(data, function(response) {
            console.log('Demographic entry created for "' + data.firstNames + ' ' + data.lastNames +
                '" (' + ehrData.ehrId + ')');

            successCallback(response, data, ehrData.ehrId);
        }, errorCallback);
    }, errorCallback);
};

Ehr.prototype.prepareData = function(data, property) {
    var prepared = [];

    for (var index in data) {
        prepared.push({date: new Date(data[index]['time']), value: data[index][property]});
    }

    return prepared;
};

Ehr.prototype.getEntries = function(ehrId, property, successCallback, errorCallback) {
    var object = this;

    var internalProperties = {
        body_temperature: 'temperature',
        height: 'height',
        weight: 'weight',
        pulse: 'pulse'
    };

    this.sendRequest('GET', '/view/' + ehrId + '/' + property, [], function(data) {
        successCallback(object.prepareData(data, internalProperties[property]))
    }, errorCallback);
};
