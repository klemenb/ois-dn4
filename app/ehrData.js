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

EhrData.prototype.getEhrIdIndex = function(ehrId) {
    var data = this.get();
    var index = 0;

    for (var id in data) {
        if (id == ehrId) return index;
        index++;
    }

    return 0;
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
                                                   height, weight, pulse, spO2, successCallback, errorCallback) {
    var composition = {
        'ctx/time': time,
        'ctx/language': 'en',
        'ctx/territory': 'SI',
        'vital_signs/body_temperature/any_event/temperature|magnitude': temperature,
        'vital_signs/body_temperature/any_event/temperature|unit': '°C',
        'vital_signs/blood_pressure/any_event/systolic': systolic,
        'vital_signs/blood_pressure/any_event/diastolic': diastolic,
        'vital_signs/height_length/any_event/body_height_length': height,
        'vital_signs/body_weight/any_event/body_weight': weight,
        'vital_signs/indirect_oximetry:0/spo2|numerator': spO2,
        'vital_signs/pulse/any_event/rate': pulse
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
        object.generateCompositeData(ehrId, '2014-04-10T08:00Z', 36.4, 130, 90, 178, 80, 72, 98, null, null);
        object.generateCompositeData(ehrId, '2014-05-10T08:00Z', 36.8, 160, 100, 179, 84, 56, 98, null, null);
        object.generateCompositeData(ehrId, '2014-06-10T08:00Z', 36.8, 122, 82, 179, 86, 52, 94, null, null);
        object.generateCompositeData(ehrId, '2014-07-10T08:00Z', 36.8, 120, 80, 179, 82, 50, 96, null, null);
        object.generateCompositeData(ehrId, '2014-08-10T08:00Z', 36.4, 120, 80, 180, 80, 50, 99, null, null);
        object.generateCompositeData(ehrId, '2014-09-10T08:00Z', 36.9, 160, 120, 180, 96, 50, 99, null, null);
        object.generateCompositeData(ehrId, '2014-10-10T08:00Z', 37.8, 154, 85, 180, 98, 60, 99, null, null);
        object.generateCompositeData(ehrId, '2014-11-10T08:00Z', 38, 140, 88, 180, 105, 62, 99, null, null);
        object.generateCompositeData(ehrId, '2014-12-10T08:00Z', 36.2, 142, 85, 180, 108, 64, 99, null, null);

        object.storeEhrData(response, data, ehrId);
    });

    this.ehr.createFullEhrRecord(sarahJohnson, function(response, data, ehrId) {
        object.generateCompositeData(ehrId, '2014-04-10T08:00Z', 36.2, 130, 90, 164, 54, 72, 98, null, null);
        object.generateCompositeData(ehrId, '2014-05-10T08:00Z', 36.2, 160, 100, 165, 48, 56, 98, null, null);
        object.generateCompositeData(ehrId, '2014-06-10T08:00Z', 36.4, 122, 82, 165, 50, 52, 94, null, null);
        object.generateCompositeData(ehrId, '2014-07-10T08:00Z', 36.6, 120, 80, 165, 52, 50, 96, null, null);
        object.generateCompositeData(ehrId, '2014-08-10T08:00Z', 36.4, 120, 80, 165, 54, 50, 99, null, null);
        object.generateCompositeData(ehrId, '2014-09-10T08:00Z', 36.6, 130, 70, 165, 52, 50, 99, null, null);
        object.generateCompositeData(ehrId, '2014-10-10T08:00Z', 37.8, 130, 70, 165, 46, 60, 99, null, null);
        object.generateCompositeData(ehrId, '2014-11-10T08:00Z', 38, 140, 80, 165, 42, 62, 99, null, null);
        object.generateCompositeData(ehrId, '2014-12-10T08:00Z', 38.6, 140, 80, 165, 42, 64, 99, null, null);

        object.storeEhrData(response, data, ehrId);
    });

    this.ehr.createFullEhrRecord(robertSmith, function(response, data, ehrId) {
        object.generateCompositeData(ehrId, '2014-04-10T08:00Z', 36.2, 130, 90, 178, 70, 72, 98, null, null);
        object.generateCompositeData(ehrId, '2014-05-10T08:00Z', 36.2, 135, 100, 179, 72, 56, 98, null, null);
        object.generateCompositeData(ehrId, '2014-06-10T08:00Z', 36.4, 122, 82, 179, 71, 52, 94, null, null);
        object.generateCompositeData(ehrId, '2014-07-10T08:00Z', 36.6, 132, 80, 179, 74, 50, 96, null, null);
        object.generateCompositeData(ehrId, '2014-08-10T08:00Z', 36.4, 126, 80, 180, 72, 50, 99, null, null);
        object.generateCompositeData(ehrId, '2014-09-10T08:00Z', 36.6, 131, 75, 180, 78, 50, 99, null, null);
        object.generateCompositeData(ehrId, '2014-10-10T08:00Z', 36.2, 125, 75, 180, 76, 54, 99, null, null);
        object.generateCompositeData(ehrId, '2014-11-10T08:00Z', 36.1, 129, 80, 180, 74, 62, 99, null, null);
        object.generateCompositeData(ehrId, '2014-12-10T08:00Z', 36.4, 130, 80, 180, 75, 59, 99, null, null);

        object.storeEhrData(response, data, ehrId);
    });
};