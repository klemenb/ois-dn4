var Chart = function() {};

Chart.prototype.width = 1138;

Chart.prototype.height = 300;

Chart.prototype.lineChart = function(container, data) {
    var svg = dimple.newSvg(container, this.width, this.height);
    var chart = new dimple.chart(svg, data);

    var x = chart.addCategoryAxis('x', 'date');
    x.addOrderRule('Date');
    x.title = 'Date';
    x.tickFormat = '%e';

    var y = chart.addMeasureAxis('y', 'value');
    y.title = 'Height';

    chart.addSeries(null, dimple.plot.line);
    chart.draw();
};