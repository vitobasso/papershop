/**
 * Created by Victor on 19/07/2015.
 */
var ItemFinder = (function () {
    var module = {};

    var api;

    module.init = function () {
        api = new EbayApi();
        //api = new MLApi();
    };

    module.find = function () {
        var uiParams = UIParamsInput.getParams();
        if (uiParams.keywords) {
            try {
                var params = RequestLog.notifyNewRequestAndGetPaging(uiParams);
                checkTotalItems(params);
                api.find(params, onSuccess, onFail);
            } catch (err) {
                onFail(err);
            }
        }//TODO message when keywords empty?


        function onSuccess(result) {
            Main.updateChart(params, result.items);
            RequestLog.notifyRequestSuccessful(params, result.metadata);
        }

        function onFail(err) {
            RequestLog.notifyRequestFailed(params);
            console.log("Find failed: " + err);
        }

    };

    function checkTotalItems(params) {
        if(params.lastItem && params.totalItems
            && params.lastItem >= params.totalItems) {
            throw "No new items left for this set of filters";
        }
    }

    return module;
}());