/// <reference path="_dependencies.ts" />
module CustomDeck {
    export
    var bindLocations = function(locationElems: Element[]) {
        for (var i = 0; i < locationElems.length; ++i) {
            g_locationManager.bindLocation( < HTMLElement > locationElems[i]);
        }
    }

    export
    var bindCards = function(cardElems: Element[]) {
        for (var i = 0; i < cardElems.length; ++i) {
            g_cardManager.bindCard( < HTMLElement > cardElems[i]);
        }
    }
}
