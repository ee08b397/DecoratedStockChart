angular.module('Example', ['decorated-stock-chart']).controller("MainCtrl", function ($scope) {

    $scope.securities = [
        {id: 1, label: "T", mean: 0.08, stddev: 0.17, initPrice: 32},
        {id: 2, label: "VZ", mean: 0.05, stddev: 0.15, initPrice: 45},
        {id: 3, label: "GS", mean: 0.03, stddev: 0.23, initPrice: 184}];
    $scope.defaultSecurityAttribute = {tag: "price", label: "Price"};
    $scope.availableSecurityAttributes = [{tag: "return", label: "Return"}, {
        tag: "price",
        label: "Price"
    }, {tag: "volume", label: "Volume"}];
    $scope.onAttributeSelect = function (attr, security) {
        return {
            name: security.label + " " + attr.label,
            data: simulate(domain(), attr, security)
        };
    };
    $scope.onSecurityRemove = function (id) {
        $scope.message = "Callback Fired: Security with ID = " + id + " was Removed!";
        $("#alert").slideDown(500);
    };
    $scope.closeAlert = function () {
        $("#alert").slideUp(500);
    };
    $scope.apiHandle = {};
    // demo functions
    $scope.addSecurity = function (security) {
        $scope.apiHandle.api.addSecurity(security);
    };
});

/**
 * this returns the last 1 business year in Unix epoch
 * @returns {Array}
 */
const domain = function () {
    const x = [];
    const now = moment();
    for (var i = 0; i < 255; i++)
        x.push(now.clone().subtract(i, 'd').valueOf());
    x.reverse();
    return x;
};

const yearFrac = 1 / Math.sqrt(255);

/**
 * simulate a normal dist by summing i.i.d
 * @return {number}
 */
function nextGaussian() {
    return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
}

/**
 * return a increment of an naive Brownian motion
 * @param drift
 * @param vol
 * @return {number}
 */
function nextRandomWalk(drift, vol) {
    return nextGaussian() * vol + drift * yearFrac;
}

/**
 * generates the range for a time-series
 * @param domain
 * @param attr
 * @param security
 */
function simulate(domain, attr, security) {

    /**
     * if the requested attribute is Volume, then return really large numbers
     */
    if (attr.tag === 'volume')
        return _.map(domain, function (x) {
            return [x, nextGaussian() * 1e9];
        });

    function genReturnLikeSeries(isReturn) {
        const range = [];
        for (var i = 0; i < domain.length; i++) {
            if (i >= 1)
                range[i] = range[i - 1] * (1 + nextRandomWalk(security.mean, security.stddev));
            else
                range[i] = isReturn ? 1 : security.initPrice;
        }
        return range;
    }

    return _.zip(domain, attr.tag === 'price' ? genReturnLikeSeries(false) : genReturnLikeSeries(true));
}

