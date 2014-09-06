/// <reference path="_dependencies.ts" />
module CustomDeck {
    'use strict';

    export class Piece {
        id: number;
        transform: Transform2D = new Transform2D();
        width: number = 0;
        height: number = 0;

        getTransform(): Transform2D {
            return this.transform;
        }

        constructor() {
            this.id = uniqueID++;
        }

        save(): any {
            var obj = {
                id: this.id,
                width: this.width,
                height: this.height,
                transform: this.transform // ref
            }
        }

        load(obj: any) {
            this.id = obj.id;
            this.width = obj.width;
            this.height = obj.height;
            this.transform.copy(obj.transform);
        }
    }
}
