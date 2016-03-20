var Items = (function () {
    var module = {};

    var set;

    module.init = () => {
        set = new Set(getId);
    };

    module.merge = (newItems) => {
        set.addMergeAll(newItems, merge);
        $.publish('new-items', [newItems, module.filter(), module.list()]);
    };

    function merge(oldItem, newItem) {
        Merge.mergeObjects(oldItem.aspects, newItem.aspects); //item.aspects is a map (object), not an array
    }

    module.filter = () => {
        var params = UIParamsInput.getParams();
        var filterFunction = ItemFilter.createFilter(params);
        return set.filter(filterFunction);
    };

    module.getByCategory = category => {
        return set.filter(isCategoryEqual(category));
    };

    function isCategoryEqual(category) {
        return item => item.category.id == category.id;
    }

    module.count = () => set.size();

    module.list = () => set.toArray();

    return module;
}());