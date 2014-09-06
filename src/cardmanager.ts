/// <reference path="_dependencies.ts" />
module CustomDeck {
    'use strict';

    export class CardManager {
        cards: Card[] = [];

        createCard(): Card {
            return this.bindCard(document.createElement('div'));
        }

        // for testing
        bindCard(elem: HTMLElement): Card {
            var card = new Card(elem);
            this.addCard(card);
            return card;
        }

        addCard(card: Card) {
            this.cards.push(card);
        }

        removeCard(card: Card) {
            var i = this.cards.indexOf(card);
            if (i !== -1)
                this.cards.splice(i, 1);
        }

        save(): any {
            var obj = {
                type: 'CardManager',
                cards: []
            }
            for (var i = 0; i < this.cards.length; ++i)
                obj.cards.push(this.cards[i].save());

            return obj;
        }

        load(obj: any) {
            if (obj.type !== 'CardManager')
                return;

            this.cards.length = 0;
            for (var i = 0; i < obj.cards.length; ++i) {
                var card = this.createCard();
                card.load(obj.cards[i]);
            }
        }
    }
    export
    var g_cardManager = new CardManager();
}
