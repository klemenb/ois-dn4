var Location = function() {
    this.platform = Platform.getInstance();
};

Location.prototype.getCountry = function() {
    var browserLanguage = window.navigator.language;
    var defaultCountry = 'Slovenia';

    var countries = {
        'en-us': 'United States',
        'en': 'United Kingdom',
        'sl': 'Slovenia',
        'hr': 'Croatia'
    };

    if (!browserLanguage || !countries[browserLanguage.toLowerCase()]) {
        return defaultCountry;
    }

    return countries[browserLanguage.toLowerCase()];
};

Location.prototype.getCountryPosition = function(successCallback, errorCallback) {
    var geocodingParams = {
        searchText: this.getCountry()
    };

    var geocoder = this.platform.getGeocodingService();

    geocoder.geocode(geocodingParams, function(result) {
        var locations = result.Response.View[0].Result;

        if (locations.length > 0) {
            var position = {
                coords: {
                    latitude: locations[0].Location.DisplayPosition.Latitude,
                    longitude: locations[0].Location.DisplayPosition.Longitude
                }
            };

            successCallback(position);
        }
    }, errorCallback);
};

Location.prototype.getCurrentPosition = function(successCallback, errorCallback) {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
        timeout: 4000
    });
};
