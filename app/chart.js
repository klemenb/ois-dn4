var Chart = function() {};

Chart.prototype.width = 1138;

Chart.prototype.height = 300;

Chart.prototype.offset = {
    left: 40,
    top: 40
};

Chart.prototype.lineChart = function(container, data, axisName) {
    var svg = dimple.newSvg(container, this.width, this.height);

    var chart = new dimple.chart(svg, data);
    chart.setBounds(this.offset.left, this.offset.top, this.width - this.offset.left,
        this.height - this.offset.top);
    chart.setMargins(40, 40, 40, 40);

    var x = chart.addTimeAxis('x', 'date', null, '%d.%m.%Y');
    x.title = 'Measurement date';

    var y = chart.addMeasureAxis('y', 'value');
    y.title = axisName;

    var line = chart.addSeries(null, dimple.plot.line);
    line.lineWeight = 5;
    line.lineMarkers = true;

    line.getTooltipText = function (e) {
        return [
            'Date: ' + e.cx,
            'Data: ' + e.cy
        ];
    };

    chart.draw();
};