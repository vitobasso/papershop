/**
 * Created by Victor on 05/07/2015.
 */

function EbayChart(api) {

    var chartDivId = "#chart";

    var filters = new Filters(),
        categories = new Categories(api),
        axes = new ChartAxes(categories),
        chart = new ScatterPlot(chartDivId),
        tooltip = new ChartTooltip(),
        legend = new ChartLegend("#top", chart),
        items = [];

    var axisOptions, xAxis, colorAxis;

    this.getCategory = function (category) {
        return categories.get(category);
    };

    this.update = function (newItems) {
        filters.populate();
        categories.populate(newItems);
        this.setData(newItems);
        populateAxisMenu();
    };

    this.setData = function (newItems) {
        items = newItems;
        chart.setData(items);
        updateLegendAndTooltips();
    };

    function buildChart() {
        if (items) {
            chart.update(items, axes.priceAxis, xAxis, colorAxis);
            updateLegendAndTooltips();
        }
    }

    function updateLegendAndTooltips() {
        assignTooltips();
        legend.render(items, colorAxis);
    }

    function assignTooltips() {
        $(chartDivId).find("svg").tooltip({
            items: "circle",
            content: tooltip.render
        });
    }

    function populateAxisMenu() {
        axisOptions = axes.listOptions();
        addContextMenu(".x.label", changeXAxis);
        addContextMenu("#chart-legend .title", changeColorAxis);
    }

    function addContextMenu(selector, callback) {
        $.contextMenu({
            selector: selector,
            trigger: "left",
            callback: callback,
            items: getMenuItems()
        });
    }

    function getMenuItems() {
        return axisOptions.map(getMenuItem);
    }

    function getMenuItem(axis) {
        return {name: axis.label}
    }

    function changeXAxis(key) {
        xAxis = axisOptions[key];
        buildChart();
    }

    function changeColorAxis(key) {
        colorAxis = axisOptions[key];
        buildChart();
    }

    populateAxisMenu();
    xAxis = axisOptions[0];
    colorAxis = axisOptions[0];
    buildChart();

}
