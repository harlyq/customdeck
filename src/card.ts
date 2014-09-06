/// <reference path="_dependencies.ts" />
module CustomDeck {
    'use strict';

    var CARD_CLASS = 'DeckCard';
    var CARD_SELECTED = 'DeckCardSelected';

    export class Card extends Piece {
        location: Location; // back-pointer do not use
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;

        constructor(public root: HTMLElement) {
            super();

            if (!root.classList.contains(CARD_CLASS))
                root.classList.add(CARD_CLASS);

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            root.appendChild(this.canvas);

            this.width = 60;
            this.height = 80;
        }

        rebuild() {
            this.canvas.width = this.width;
            this.canvas.height = this.height;

            var style = this.root.style;
            style.width = this.width + 'px';
            style.height = this.height + 'px';
            setCSSTransform(style, this.getTransform().toCSS());
        }

        save(): any {
            var obj = super.save();
            obj.type = 'Card';
            return obj;
        }

        load(obj: any) {
            if (obj.type !== 'Card')
                return;

            super.load(obj);
        }
    }
}
