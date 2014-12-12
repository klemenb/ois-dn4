var Map = function() {
    this.platform = Platform.getInstance();
};

Map.prototype.setPosition = function(position) {
    this.setManualPosition(position.coords.latitude, position.coords.longitude)

    return this;
};

Map.prototype.setZoom = function(zoom) {
    this.zoom = zoom;

    if (this.map) this.map.setZoom(this.zoom, true);

    return this;
};

Map.prototype.setManualPosition = function(latitude, longitude) {
    this.position = {
        center: { lat: latitude, lng: longitude },
        zoom: this.zoom
    };

    if (this.map) this.map.setCenter(this.position.center, true);

    return this;
};

Map.prototype.render = function(containerId) {
    var defaultLayers = this.platform.createDefaultLayers();

    this.map = new H.Map(document.getElementById(containerId),
        defaultLayers.normal.map, this.position);

    this.ui = H.ui.UI.createDefault(this.map, defaultLayers);
    this.events = new H.mapevents.MapEvents(this.map);
    this.behavior = new H.mapevents.Behavior(this.events);
};

Map.prototype.addMarkerBubble = function(coordinate, title) {
    var marker = new H.map.Marker(coordinate);
    marker.setData('<div class="map-bubble">' + title + '</div>');

    var group = new H.map.Group();
    group.addObject(marker);

    var object = this;

    group.addEventListener('tap', function (evt) {
        var bubble =  new H.ui.InfoBubble(evt.target.getPosition(), {
            content: evt.target.getData()
        });

        object.ui.addBubble(bubble);
    }, false);

    this.map.addObject(group);
}

Map.prototype.markNearbyPlaces = function(query) {
    var url = '//places.demo.api.here.com/places/v1/discover/' +
              'search?at=' + this.position.center.lat + '%2C' + this.position.center.lng +
              '&q=' + query + '&accept=application%2Fjson&app_id=' + Platform.appId + '&app_code=' + Platform.appCode;

    var object = this;

    $.get(url, function(data) {
        var results = data.results;

        for (var i in results.items) {
            var result = results.items[i];
            object.addMarkerBubble({lat: result.position[0], lng: result.position[1]}, result.title);
        }
    });
};
