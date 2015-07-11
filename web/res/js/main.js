/**
 * Created by Victor on 01/07/2015.
 */
function Main() {

    var allItems = new Set(getId);
    var api = new EbayApi();
    var ebayChart = new EbayChart(api, "#x-axis-select", "#color-select");

    function addItems(newItems) {
        allItems.addMergeAll(newItems, mergeItems);
        $("#total-count").show().text(allItems.size());
    }

    function mergeItems(oldItem, newItem) {
        for (var key in  newItem.aspects) {
            if (newItem.aspects.hasOwnProperty(key)) {
                oldItem.aspects[key] = newItem.aspects[key];
            }
        }
    }

    /////////////////////////////////////////////////////////

    this.doRequest = function () {
        var params = getUIParams();
        api.find(params, function (response) {
            updateChart(params, response)
        });
    };

    function getUIParams() {
        return {
            keywords: $("#keywords").val(),
            filters: getFiltersFromUI("#filters"),
            aspects: getFiltersFromUI("#categories"),
            itemsPerPage: $("#items-per-page").val(),
            page: $("#page").val()
        };
    }

    function getFiltersFromUI(rootId) {
        var filters = [];
        $(rootId).find("select").each(function (i, filterNode) {
            var sel = $(filterNode).find("option").filter(":selected");
            if (sel.length > 0) {
                var filter = getFilterFromUI(filterNode.__data__, sel);
                filters.push(filter);
            }
        });
        return filters;
    }

    function getFilterFromUI(filter, selectedOptions){
        return {
            name: filter.name,
            values: selectedOptions.toArray().map(function (option) {
                var getValueId = filterValueIdGetter(filter);
                return getValueId(option.__data__)
            })
        }
    }

    function filterValueIdGetter(filter) {
        return filter.getValueId || getName;
    }

    /////////////////////////////////////////////////////////

    this.applyFilters = function () {
        var items = filterItems();
        ebayChart.repopulate(items);
    };

    function updateChart(requestParams, newItems) {
        guessAspectsFromTitle(newItems);
        rememberAspectsFromRequest(requestParams, newItems);
        addItems(newItems);
        var items = filterItems();
        ebayChart.update(items);
    }

    function filterItems() {
        var params = getUIParams();
        var filterFunction = new ItemFilter(params).filter;
        return allItems.filter(filterFunction);
    }

    ////////////////////////////////////////////////////////////

    function guessAspectsFromTitle(newItems) {
        newItems.forEach(function (item) {
            var category = ebayChart.getCategory(item.category);
            if (category && category.fuzzyValues) {
                guessAspects(item, category);
            }
        });
    }

    function rememberAspectsFromRequest(requestParams, newItems) {
        var requestAspects = getAspectsFromRequest(requestParams);
        newItems.forEach(function (item) {
            for (var aspectName in requestAspects) {
                if (requestAspects.hasOwnProperty(aspectName)) {
                    item.aspects[aspectName] = {
                        value: requestAspects[aspectName],
                        confidence: 2
                    };
                }
            }
        });
    }

    function getAspectsFromRequest(requestParams) {
        var singleValueAspects = requestParams.aspects.filter(function (aspect) {
            return aspect.values.length == 1;
        });
        var aspectsMap = {};
        singleValueAspects.forEach(function (aspect) {
            aspectsMap[aspect.name] = aspect.values[0];
        });
        return aspectsMap;
    }

}

///////////////////////////////////////////////////////////

function showError(msg) {
    $("#error-msg").html(msg);
}
