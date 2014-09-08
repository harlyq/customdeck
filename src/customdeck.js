/// <reference path="_dependencies.ts" />
var CustomDeck;
(function (CustomDeck) {
    CustomDeck.bindLocations = function (locationElems) {
        for (var i = 0; i < locationElems.length; ++i) {
            CustomDeck.g_locationManager.bindLocation(locationElems[i]);
        }
    };

    CustomDeck.bindCards = function (cardElems) {
        for (var i = 0; i < cardElems.length; ++i) {
            CustomDeck.g_cardManager.bindCard(cardElems[i]);
        }
    };

    CustomDeck.getMap = function () {
        var mapA = new Map();
        mapA.set('first', '10');
        return mapA;
    };
})(CustomDeck || (CustomDeck = {}));
