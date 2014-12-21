var Search = function() {};

Search.abstractCallback = function(data) {};

Search.getResults = function(query, successCallback, errorCallback) {
    $.ajax({
        url: '//api.duckduckgo.com/',
        data: {q: query, format: 'json'},
        method: 'GET',
        dataType: 'jsonp',
        jsonpCallback: 'Search.processResults'
    });
};

Search.processResults = function(data) {
    this.abstractCallback({
        heading: data.Heading,
        source: data.AbstractSource,
        url: data.AbstractURL,
        text: data.Abstract
    });
};

Search.getAbstract = function(query, callback) {
    this.abstractCallback = callback;

    this.getResults(query);
};