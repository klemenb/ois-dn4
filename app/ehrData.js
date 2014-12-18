var EhrData = function(ehr) {
    this.ehr = ehr;

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
        this.successCallback();
    }
};

EhrData.prototype.generateCompositeData = function(ehrId, time, temperature, systolic, diastolic,
                                                   height, weight, successCallback, errorCallback) {
    var bmi = weight / ((height / 100) * (height / 100));

    var composition = {
        "ctx/time": time,
        "ctx/language": "en",
        "ctx/territory": "SI",
        "vital_signs/body_temperature/any_event/temperature|magnitude": temperature,
        "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        "vital_signs/blood_pressure/any_event/systolic": systolic,
        "vital_signs/blood_pressure/any_event/diastolic": diastolic,
        "vital_signs/height_length/any_event/body_height_length": height,
        "vital_signs/body_weight/any_event/body_weight": weight,
        "vital_signs/body_mass_index/any_event/body_mass_index": bmi
    };

    var params = {
        ehrId: ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT',
        committer: 'Gregory House'
    };

    this.ehr.createCompositionEntry(composition, params, successCallback, errorCallback);
};

EhrData.prototype.generateData = function(successCallback, errorCallback) {
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;

    var johnWilliams = {
        firstNames: 'John',
        lastNames: 'Williams',
        gender: 'MALE',
        dateOfBirth: '1998-03-15T11:00Z'
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

    var object = this;

    this.ehr.createFullEhrRecord(johnWilliams, function(response, data, ehrId) {
        object.generateCompositeData(ehrId, '2014-01-10T08:00Z', 36, 120, 80, 178, 80, null, null);
        object.generateCompositeData(ehrId, '2014-02-10T08:00Z', 36.2, 120, 82, 178, 80, null, null);
        object.generateCompositeData(ehrId, '2014-03-10T08:00Z', 36, 128, 86, 178, 80, null, null);
        object.generateCompositeData(ehrId, '2014-04-10T08:00Z', 36.4, 130, 90, 178, 80, null, null);
        object.generateCompositeData(ehrId, '2014-05-10T08:00Z', 36.8, 160, 100, 179, 84, null, null);
        object.generateCompositeData(ehrId, '2014-06-10T08:00Z', 36.8, 122, 82, 179, 86, null, null);
        object.generateCompositeData(ehrId, '2014-07-10T08:00Z', 36.8, 120, 80, 179, 82, null, null);
        object.generateCompositeData(ehrId, '2014-08-10T08:00Z', 36.4, 120, 80, 180, 80, null, null);
        object.generateCompositeData(ehrId, '2014-09-10T08:00Z', 36.9, 160, 120, 180, 78, null, null);
        object.generateCompositeData(ehrId, '2014-10-10T08:00Z', 37.8, 90, 60, 180, 76, null, null);
        object.generateCompositeData(ehrId, '2014-11-10T08:00Z', 38, 110, 70, 180, 74, null, null);
        object.generateCompositeData(ehrId, '2014-12-10T08:00Z', 36.2, 120, 80, 180, 72, null, null);

        object.storeEhrData(response, data, ehrId);
    });

    this.ehr.createFullEhrRecord(sarahJohnson, function(response, data, ehrId) {
        object.storeEhrData(response, data, ehrId);
    });

    this.ehr.createFullEhrRecord(robertSmith, function(response, data, ehrId) {
        object.storeEhrData(response, data, ehrId);
    });
};