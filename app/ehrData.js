var EhrData = function() {
    this.totalRecords = 3;
    this.tempEhrData = {};

    this.successCallback = null;
    this.errorCallback = null;
};

EhrData.prototype.get = function() {
    return JSON.parse(localStorage.getItem('ehrData'));
};

EhrData.prototype.getDefaultEhrId = function() {
    var data = this.get();

    for (var ehrId in data) {
        if (data[ehrId].firstNames == 'John') {
            return ehrId;
        }
    }

    return null;
};

EhrData.prototype.isAvailable = function() {
    return localStorage.getItem('ehrData') !== null;
};

EhrData.prototype.storeEhrData = function(response, data, ehrId) {
    this.tempEhrData[ehrId] = data;

    if (Object.keys(this.tempEhrData).length == this.totalRecords) {
        localStorage.setItem('ehrData', JSON.stringify(this.tempEhrData));

        this.tempEhrData = [];
        this.successCallback(this);
    }
};

EhrData.prototype.generateData = function(successCallback, errorCallback) {
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;

    var johnWilliams = {
        firstNames: 'John',
        lastNames: 'Williams',
        gender: 'MALE',
        dateOfBirth: '1993-03-15T11:00Z'
    };

    var sarahJohnson = {
        firstNames: 'Sarah',
        lastNames: 'Johnson',
        gender: 'FEMALE',
        dateOfBirth: '1980-11-18T20:00Z'
    };

    var robertSmith = {
        firstNames: 'Robert',
        lastNames: 'Smith',
        gender: 'MALE',
        dateOfBirth: '1964-06-17T08:00Z'
    };

    var ehr = new Ehr();
    var object = this;
    var ehrData = [];

    ehr.createFullEhrRecord(johnWilliams, function(response, data, ehrId) {
        object.storeEhrData(response, data, ehrId);
    });

    ehr.createFullEhrRecord(sarahJohnson, function(response, data, ehrId) {
        object.storeEhrData(response, data, ehrId);
    });

    ehr.createFullEhrRecord(robertSmith, function(response, data, ehrId) {
        object.storeEhrData(response, data, ehrId);
    });
};