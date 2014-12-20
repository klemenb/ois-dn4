function loadSelector(currentEhrId, ehrObjects) {
    var selected = ehrObjects[currentEhrId];

    $("#dropdown-selected").text(selected.firstNames + ' ' + selected.lastNames);

    for (var ehrId in ehrObjects) {
        if (ehrId == currentEhrId) continue;

        $("#dropdown-selector").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="?ehrId=' +
            ehrId + '">' + ehrObjects[ehrId].firstNames + ' ' + ehrObjects[ehrId].lastNames + '</a></li>');
    }
}

function ehrDataLoaded(ehr, ehrData, chart) {
    var containerWide = $('.container-wide');
    var containerMap = $('#container-map');
    var toggleButton = $('#ehr-toggle-button');

    // Get current ehrId and load appropriate data
    // (fallback to first EHR entry when no ehrId specified)
    var params = window.location.search.split('=');
    var currentEhrId = params.length > 1 ? params[1] : ehrData.getDefaultEhrId();

    console.log('Current ehrId: ' + currentEhrId);

    // Update toggle button text, register EHR/MAP toggle event
    toggleButton
        .text('Toggle EHR / MAP display')
        .click(function() {
        if (containerWide.css('display') === 'none') {
            containerWide.fadeIn(500);
            containerMap.animate({ opacity: 0.25 }, 500);
        } else {
            containerWide.fadeOut(500);
            containerMap.animate({ opacity: 1 }, 500);
        }
    });

    // Register chart selector
    $('.property').click(function() {
        var selectedProperty = this;
        var chartProperty = $(this).data('chart-property');
        var chartName = $(this).data('chart-name');

        ehr.getEntries(currentEhrId, chartProperty, function(data) {
            $('#chart').html('');
            chart.lineChart('#chart', data, chartName);

            $('.property').removeClass('property-active');
            $(selectedProperty).addClass('property-active');
        }, null);
    });

    // Select default chart
    $('#property-weight').click();

    // Re-use click animations and display current EHR
    toggleButton.click();

    // Update people selector
    loadSelector(currentEhrId, ehrData.get());
}

$(document).ready(function() {
    var map = new Map();
    var location = new Location();

    // Set default position over Europe
    map.setManualPosition(48.7155497, 16.8293236).setZoom(5);

    // Try to get current country position
    location.getCountryPosition(function(position) {
        map.setPosition(position).setZoom(5);

        map.markNearbyPlaces('hospital');
        map.markNearbyPlaces('recreation');

        // Now try to use geolocation for a more accurate result
        // * We need to get country first as the 'Not now' button in Firefox doesn't trigger any response
        // * and therefore we can't handle this case with success/error callbacks (and only fallback to country
        // * location when geolocation is not available or is denied).
        location.getCurrentPosition(function(position) {
            map.setPosition(position).setZoom(13);

            map.markNearbyPlaces('hospital');
            map.markNearbyPlaces('recreation');
        }, function() {});
    }, function() {});

    map.render('container-map');

    var ehr = new Ehr();
    var ehrData = new EhrData(ehr);
    var chart = new Chart();

    // Check for EHR data (ehrId's to use in the application)
    // and regenerate it when neccessary.
    if (!ehrData.isAvailable()) {
        $('#ehr-toggle-button').text('Generating dummy EHR data...');

        ehrData.generateData(function() {
            ehrDataLoaded(ehr, ehrData, chart);
        });
    } else {
        ehrDataLoaded(ehr, ehrData, chart);
    }
});