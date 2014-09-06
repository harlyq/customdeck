/// <reference path="_dependencies.ts" />
module CustomDeck {
    'use strict';

    export class LocationManager {
        locations: Location[] = [];

        createLocation(): Location {
            return this.bindLocation(document.createElement('div'));
        }

        // for testing
        bindLocation(elem: HTMLElement): Location {
            var location = new Location(elem);
            this.addLocation(location);
            return location;
        }

        addLocation(location: Location) {
            this.locations.push(location);
        }

        removeLocation(location: Location) {
            var i = this.locations.indexOf(location);
            if (i !== -1)
                this.locations.splice(i, 1);
        }

        save(): any {
            var obj = {
                type: 'LocationManager',
                locations: []
            };
            for (var i = 0; i < this.locations.length; ++i)
                obj.locations.push(this.locations[i].save());
            return obj;
        }

        load(obj: any) {
            if (obj.type !== 'LocationManager')
                return;

            for (var i = 0; i < obj.locations.length; ++i) {
                var location = this.createLocation();
                location.load(obj.locations[i]);
            }
        }
    }
    export
    var g_locationManager = new LocationManager();
}
