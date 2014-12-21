var Chart = function() {
    $(window).resize(function() {
        if (Chart.lastChart != null) {
            Chart.lastChart.draw(0, null);
        }
    });
};

Chart.lastChart = null;

Chart.prototype.width = '100%';

Chart.prototype.height = 300;

Chart.prototype.margin = {
    left: 50,
    top: 40,
    right: 10,
    bottom: 40
};

Chart.prototype.dateFormat = '%d. %m. %Y';

Chart.prototype.prepareChart = function(container, data, axisName) {
    $(container).html('');
    var svg = dimple.newSvg(container, this.width, this.height);

    var chart = new dimple.chart(svg, data);
    chart.setBounds(0, 0, this.width, this.height);
    chart.setMargins(this.margin.left, this.margin.top, this.margin.right, this.margin.bottom);

    var x = chart.addTimeAxis('x', 'date', null, this.dateFormat);
    x.title = '';

    var y = chart.addMeasureAxis('y', 'value');
    y.title = axisName;

    return chart;
};

Chart.prototype.lineChart = function(container, data, axisName, color) {
    var chart = this.prepareChart(container, data, axisName);
    chart.defaultColors = [ new dimple.color(color, color) ];

    var format = d3.time.format(this.dateFormat);

    var line = chart.addSeries(null, dimple.plot.line);
    line.lineWeight = 4;
    line.lineMarkers = true;

    line.getTooltipText = function (e) {
        return [
            'Date: ' + format(e.cx),
            'Data: ' + e.cy
        ];
    };

    chart.draw();
    Chart.lastChart = chart;
};

Chart.prototype.multiLineChart = function(container, data, axisName, colors) {
    var chart = this.prepareChart(container, data, axisName);
    var format = d3.time.format(this.dateFormat);

    chart.defaultColors = [];

    for (var index in colors) {
        chart.defaultColors.push(new dimple.color(colors[index], colors[index]));
    }

    var line = chart.addSeries('type', dimple.plot.line);
    line.lineWeight = 4;
    line.lineMarkers = false;

    line.getTooltipText = function (e) {
        return [
            'Date: ' + format(e.cx),
            'Data: ' + e.cy
        ];
    };

    chart.addLegend(this.margin.left, this.height - this.margin.top + 28, 600, 50);
    chart.draw();
    Chart.lastChart = chart;
};