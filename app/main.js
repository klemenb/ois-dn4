function loadSelector(currentEhrId, ehrObjects) {
    var selected = ehrObjects[currentEhrId];

    $("#dropdown-selected").text(selected.firstNames + ' ' + selected.lastNames);

    for (var ehrId in ehrObjects) {
        if (ehrId == currentEhrId) continue;

        $("#dropdown-selector").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="?ehrId=' +
            ehrId + '">' + ehrObjects[ehrId].firstNames + ' ' + ehrObjects[ehrId].lastNames + '</a></li>');
    }
}

function ehrDataLoaded(ehrData) {
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

    var ehrData = new EhrData();

    // Check for EHR data (ehrId's to use in the application)
    // and regenerate it when neccessary.
    if (!ehrData.isAvailable()) {
        $('#ehr-toggle-button').text('Generating dummy EHR data...');
        ehrData.generateData(ehrDataLoaded);
    } else {
        ehrDataLoaded(ehrData);
    }

    var margin = {top: 20, right: 20, bottom: 30, left: 50};

    var width = 960 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

    var parseDate = d3.time.format('%d-%b-%y').parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });

    var svg = d3.select('#chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    d3.tsv('data.tsv', function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.close = +d.close;
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain(d3.extent(data, function(d) { return d.close; }));

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Price ($)');

        svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line);
    });
});