/// <reference path="_dependencies.ts" />
module CustomDeck {
    'use strict';

    var LOCATION_CLASS = 'DeckLocation';
    var LOCATION_SELECTED = 'DeckLocationSelected';

    export enum Layout {
        Stack, FanHorizontal, FanVertical, Random
    }

    export enum Visibility {
        None, FaceDown, FaceUp
    }

    export class Location extends Piece {
        cards: Card[] = []; // ref
        layout: Layout = Layout.Stack;
        rebuildFunc: {
            [layout: number]: () => void
        } = {};
        values: {
            [key: string]: string
        } = {};
        visibility: {
            [role: string]: Visibility
        }

        constructor(public root: HTMLElement) {
            super();

            this.rebuildFunc[Layout.Stack] = this.rebuildStack.bind(this);
            this.rebuildFunc[Layout.FanHorizontal] = this.rebuildFanHorizontal.bind(this);
            this.rebuildFunc[Layout.FanVertical] = this.rebuildFanVertical.bind(this);
            this.rebuildFunc[Layout.Random] = this.rebuildRandom.bind(this);

            if (!root.classList.contains(LOCATION_CLASS))
                root.classList.add(LOCATION_CLASS);

            this.rebuild();
        }

        addCard(card: Card) {
            if (card.location)
                card.location.removeCard(card);

            this.cards.push(card);
            card.location = this;

            this.rebuild();
        }

        removeCard(card: Card) {
            if (card.location !== this)
                return; // can't remove a card we don't own!

            var i = this.cards.indexOf(card);
            if (i === -1)
                return; // card not found

            this.cards.splice(i, 1);
            card.location = null;
            this.rebuild();
        }

        rebuild() {
            var style = this.root.style;
            style.width = this.width + 'px';
            style.height = this.height + 'px';
            setCSSTransform(style, this.getTransform().toCSS());

            this.rebuildFunc[this.layout]();
        }

        rebuildStack() {
            for (var i = 0; i < this.cards.length; ++i) {
                var card = this.cards[i];
                card.getTransform().copy(this.getTransform());
                card.rebuild();
            }
        }

        rebuildFanHorizontal() {

        }

        rebuildFanVertical() {

        }

        rebuildRandom() {
            for (var i = 0; i < this.cards.length; ++i) {
                var card = this.cards[i];
                var x = Math.random() * Math.max(0, this.width - card.width);
                var y = Math.random() * Math.max(0, this.height - card.height);
                card.getTransform().setTranslate(x, y);
                card.rebuild();
            }
        }

        save(): any {
            var obj = super.save();
            obj.type = 'Location';
            obj.layout = this.layout;
        }

        load(obj: any) {
            if (obj.type !== 'Location')
                return;

            this.layout = obj.layout;
        }
    }
}
