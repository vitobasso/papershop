
var ChartManager = (function () {
    var module = {};

    var items;
    var axisOptions, xAxis, yAxis;

    module.init = _ => {
        items = []
        $.subscribe('new-items', onNewItems)
        $.subscribe('apply-filter', onApplyFilter)
        $.subscribe('new-filters', updateAxisOptions)
        updateAxisOptions() //FIXME depends on Categories
        yAxis = AxisFactory.priceAxis
        xAxis = axisOptions[0]
        buildChart() //FIXME depends on ChartRenderer
    };

    function onNewItems(_, newItems, filtered) {
        updateAxisOptions();
        setData(filtered);
    }

    function onApplyFilter(_, filtered){
        setData(filtered);
    }

    function setData(newItems) {
        items = newItems;
        ChartRenderer.setData(items);
    }

    function updateAxisOptions() {
        axisOptions = AxisFactory.listOptions();
    }

    function buildChart() {
        if (items) ChartRenderer.update(items, yAxis, xAxis);
    }

    ////////////////////////////////////////////////////////////////////////


    module.changeAxisByName = name => {
        var axis = axisOptions.find(labelEquals(name));
        if (axis) {
            xAxis = axis;
            buildChart();
        }
    };

    module.getXAxis = _ => xAxis;
    module.getYAxis = _ => yAxis;

    function labelEquals(name) {
        return function (axis) {
            return axis.label == name
        }
    }

    return module;
}());
