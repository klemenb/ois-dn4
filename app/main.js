var ehr, ehrData, currentEhrId, whoData, health, chart;
var currentEhrData, currentGender, currentAge;

function getBmiData(heightData, weightData) {
    var data = [];

    for (var index in heightData) {
        var bmi = weightData[index].value / (Math.pow(heightData[index].value / 100, 2));
        data.push({date: new Date(heightData[index].date), value: bmi});
    }

    return data;
}

function getBloodPressureData(bloodPressureData, whoSystolic) {
    var data = [];
    var ehrObjects = ehrData.get();
    var fullName = ehrObjects[currentEhrId].firstNames + ' ' + ehrObjects[currentEhrId].lastNames

    for (var index in bloodPressureData) {
        data.push({date: new Date(bloodPressureData[index].date), type: 'systolic (' + fullName + ')', value: bloodPressureData[index].systolic});
        data.push({date: new Date(bloodPressureData[index].date), type: 'diastolic (' + fullName + ')', value: bloodPressureData[index].diastolic});
        data.push({date: new Date(bloodPressureData[index].date), type: 'systolic (WHO, age 25+)', value: whoSystolic});
    }

    return data;
}

function toggleChart(el) {
    var chartProperty = $(el).data('chart-property');
    var chartType = $(el).data('chart-type');
    var chartName = $(el).data('chart-name');

    if (chartProperty == 'blood_pressure') {
        ehr.getEntries(currentEhrId, 'blood_pressure', function(data) {
            whoData.getMeanSystolicBloodPressure(currentGender, function(systolic) {
                chart.multiLineChart('#chart', getBloodPressureData(data, systolic),
                    chartName, ['#020004', '#DDDDDD', '#00ABE8']);
                toggleChartButton(el);
            }, null);
        }, null);
    } else if (chartProperty == 'BMI') {
        ehr.getEntries(currentEhrId, 'height', function(heightData) {
            ehr.getEntries(currentEhrId, 'weight', function(weightData) {
                chart[chartType]('#chart', getBmiData(heightData, weightData), chartName, '#020004');
                toggleChartButton(el);
            }, null);
        }, null);
    } else {
        ehr.getEntries(currentEhrId, chartProperty, function(data) {
            chart[chartType]('#chart', data, chartName, '#020004');
            toggleChartButton(el);
        }, null);
    }
}

function toggleChartButton(el) {
    $('.property').removeClass('property-active');
    $(el).addClass('property-active');
}

function loadSelector() {
    var ehrObjects = ehrData.get();
    var selected = ehrObjects[currentEhrId];

    $('#dropdown-selected').text(selected.firstNames + ' ' + selected.lastNames);

    for (var ehrId in ehrObjects) {
        if (ehrId == currentEhrId) continue;

        $('#dropdown-selector').append('<li role="presentation"><a role="menuitem" tabindex="-1" href="?ehrId=' +
        ehrId + '">' + ehrObjects[ehrId].firstNames + ' ' + ehrObjects[ehrId].lastNames + '</a></li>');
    }
}

function loadAllergies() {
    ehr.getAllergyEntries(ehrData.getEhrIdIndex(currentEhrId), function(data) {
        var container = $('#allergies').html('');

        // Create allergy list entries
        for (var index in data) {
            container.append('<li><a href="#">' + data[index].agent + '</a></li>');
        }

        // Register search events
        $('#allergies a').click(function() {
            var term = $(this).html();
            var query = term.toLowerCase() + ' allergy';

            Search.getAbstract(query, function(abstract) {
                var html = '<div class="search-query">Results for &raquo;' + query + '&laquo;:</div>' +
                    '<div class="search-source"><a href="' + abstract.url + '" target="_blank">' + abstract.source + '</a></div>' +
                    '<div class="search-text">' + abstract.text + '</div>' +
                    '<div class="search-url">(url: ' + abstract.url + ')</div>';

                $('#search-result').html(html);
            });
        });

    }, null);
}

function loadHealthRisks() {
    whoData.getMeanSystolicBloodPressure(currentGender, function(systolic) {
        var risks = health.getHealthRisks(currentEhrData, systolic);
        var container = $('#health-risks');
        var html = '';

        if (risks.length == 0) {
            container.html('<div class="health-risk-description health-risk-none"><i class="fa fa-check-circle"></i> ' +
                'There are currently no health risks. Keep up the good work!</div>');
            return;
        }

        for (var index in risks) {
            html += '<div class="health-risk-description"><i class="fa fa-exclamation-circle"></i> ' +
                risks[index].description + '</div><div class="health-risk-suggestions">';

            for (var sIndex in risks[index].suggestions) {
                html += '<div class="health-risk-suggestion">' + risks[index].suggestions[sIndex] + '</div>';
            }

            html += '</div>';
        }

        container.html(html);

    }, null);
}

function loadLatestData() {
    var query = 'select ' +
    'a/content[openEHR-EHR-OBSERVATION.body_temperature.v1]/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperature, ' +
    'a/content[openEHR-EHR-OBSERVATION.blood_pressure.v1]/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as systolic, ' +
    'a/content[openEHR-EHR-OBSERVATION.blood_pressure.v1]/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude as diastolic, ' +
    'a/content[openEHR-EHR-OBSERVATION.height.v1]/data[at0001]/events[at0002]/data[at0003]/items[at0004, \'Body Height/Length\']/value/magnitude as height, ' +
    'a/content[openEHR-EHR-OBSERVATION.body_weight.v1]/data[at0002]/events[at0003]/data[at0001]/items[at0004, \'Body weight\']/value/magnitude as weight, ' +
    'a/content[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1]/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as pulse, ' +
    'a/content[openEHR-EHR-OBSERVATION.indirect_oximetry.v1]/data[at0001]/events[at0002]/data[at0003]/items[at0006]/value/numerator as oxygenation ' +
    'from EHR e[ehr_id/value=\'' + currentEhrId + '\']' +
    'contains COMPOSITION a[openEHR-EHR-COMPOSITION.encounter.v1] ' +
    'where a/name/value=\'Vital Signs\' ' +
    'order by ' +
    'a/content[openEHR-EHR-OBSERVATION.body_temperature.v1]/data[at0002]/events[at0003]/time desc ' +
    'offset 0 limit 1';

    ehr.getAqlResults(currentEhrId, query, function(data) {
        var results = data.resultSet[0];
        var bmi = Math.round(results.weight / (Math.pow(results.height / 100, 2)));
        var bloodPressure = results.systolic + '/' + results.diastolic;

        currentEhrData = results;
        currentEhrData.bmi = bmi;

        $('#property-height').html(results.height + ' cm');
        $('#property-weight').html(results.weight + ' kg');
        $('#property-bmi').html(bmi);

        $('#property-temperature').html(results.temperature + ' °C');
        $('#property-blood-pressure').html(bloodPressure + ' mm Hg');
        $('#property-pulse').html(results.pulse + '');
        $('#property-oxygenation').html(results.oxygenation + ' %');
    }, null);

    ehr.getDemographicsEntry(currentEhrId, function(data) {
        var partyData = data.party;
        currentGender = partyData.gender;

        if (currentGender == 'MALE') {
            $('#property-gender').html('<i class="fa fa-male"></i>');
        } else {
            $('#property-gender').html('<i class="fa fa-female"></i>');
        }

        // It's not 100% accurate, but good enough for a demo application
        var dateOfBirth = +new Date(data.party.dateOfBirth);
        currentAge = ~~((Date.now() - dateOfBirth) / (31557600000))

        $('#property-age').html(currentAge);
    });
}

function updateEhrData() {
    var containerWide = $('.container-wide');
    var containerMap = $('#container-map');
    var toggleButton = $('#ehr-toggle-button');
    var regenerateButton = $('#ehr-generate-button');

    // Register "regenerate dummy EHR data" button event
    regenerateButton.show().click(function() {
        localStorage.clear();
        window.location = '//' + window.location.host + window.location.pathname;
    });

    // Get current ehrId and load appropriate data
    // (fallback to first EHR entry when no ehrId specified)
    var params = window.location.search.split('=');
    currentEhrId = params.length > 1 ? params[1] : ehrData.getDefaultEhrId();

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

    // Load latest EHR data
    loadLatestData();

    // Register chart selector
    $('.property').click(function() {
        toggleChart(this);
    });

    // Select default chart
    $('#property-blood-pressure').click();

    // Re-use click animations and display current EHR
    toggleButton.click();

    loadSelector();
    loadAllergies();
    loadHealthRisks();
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

    ehr = new Ehr();
    ehrData = new EhrData(ehr);
    chart = new Chart();
    whoData = new WhoData();
    health = new Health();

    // Check for EHR data (ehrId's to use in the application)
    // and regenerate it when neccessary.
    if (!ehrData.isAvailable()) {
        $('#ehr-toggle-button').text('Generating dummy EHR data...');

        ehrData.generateData(function() {
            updateEhrData();
        });
    } else {
        updateEhrData();
    }
});