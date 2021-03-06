module VirtualDeck {
    // playerID = 1..numPlayers
    // roleID == playerID or roleID > playerID
    // userID == (playerID or roleID)

    export
    var assert = function(cond: any) {
        if (!cond)
            debugger;
    }

    var logElem;

    export
    var log = function(msg: string) {
        if (!logElem) {
            logElem = document.createElement('div');
            logElem.classList.add('Log');
            document.body.appendChild(logElem);
        }

        msg += '<br/>' + logElem.innerHTML;
        logElem.innerHTML = msg;
    }

    function clamp < T > (val: T, max: T, min: T) {
        if (val < min) return min;
        else if (val > max) return max;
        else return val;
    }

    //-------------------------------------------
    // secret is used when no details are known, not even the quantity
    export enum Visibility {
        Secret, None, Top, All // least to most visible
    };

    //-------------------------------------------
    export enum PositionType {
        Top, Bottom, Random
    }

    //-------------------------------------------
    export class VCard {
        location: VLocation = null;
        values: {
            [key: string]: any // any string, number or boolean
        } = {};

        constructor(public cardID: number) {}

        copy(other: VCard): VCard {
            this.location = other.location;
            this.cardID = other.cardID;

            for (var i in other.values)
                this.values[i] = other.values[i];

            return this;
        }

        clone(): VCard {
            var card = new VCard(this.cardID);
            return card.copy(this);
        }

        save(): any {
            return {
                cardID: this.cardID,
                values: this.values // ref
            };
        }

        load(obj: any) {
            this.cardID = obj.cardID;
            this.values = obj.values; // ref
        }
    }

    //-------------------------------------------
    export class VLocation {
        cards: VCard[] = [];
        visibility: {
            [userID: number]: Visibility
        } = {};
        addTo: PositionType = PositionType.Top;

        get numCards(): number {
            return this.cards.length;
        }

        constructor(public name: string, public locationID: number, public userID: number) {}

        getCards(): VCard[] {
            return this.cards;
        }

        getCardByID(cardID: number): VCard {
            for (var i = 0; i < this.cards.length; ++i) {
                if (this.cards[i].cardID === cardID)
                    return this.cards[i];
            }
            return null;
        }

        getCardByIndex(i: number, positionType: PositionType = PositionType.Top): VCard {
            switch (positionType) {
                case PositionType.Top:
                    i = this.cards.length - i;
                    break;

                case PositionType.Random:
                    i = ~~Math.random() * this.cards.length;
                    break;
            }

            return this.cards[clamp(i, 0, this.cards.length)]
        }

        getTopCard(): VCard {
            return this.cards[this.cards.length - 1];
        }

        getBottomCard(): VCard {
            return this.cards[0];
        }

        getRandomCard(): VCard {
            return this.cards[Math.random() * this.cards.length];
        }

        containsCard(card: VCard): boolean {
            return this.cards.indexOf(card) !== -1;
        }

        insertCard(card: VCard, i: number = 1e10) {
            if (card.location)
                card.location.removeCard(card);

            this.cards.splice(i, 0, card);
            card.location = this;
        }

        removeCard(card: VCard) {
            if (card.location !== this)
                return; // not at this location

            var i = this.cards.indexOf(card);
            if (i === -1)
                return; // not in the list!

            card.location = null;
            this.cards.splice(i, 1);
        }

        moveCard(card: VCard) {
            if (card.location)
                card.location.removeCard(card);

            switch (this.addTo) {
                case PositionType.Top:
                    this.insertCard(card);
                    break;
                case PositionType.Bottom:
                    this.insertCard(card, 0);
                    break;
                case PositionType.Random:
                    this.insertCard(card, Math.floor(Math.random() * this.cards.length));
                    break;
            }
        }

        reset() {
            for (var i = 0; i < this.cards.length; ++i)
                this.cards[i].location = null;

            this.cards.length = 0;
        }

        swapCards(i: number, j: number) {
            var card = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = card;
        }

        getVisibility(userID: number): Visibility {
            return this.visibility[userID];
        }

        setVisibility(userID: number, vis: Visibility) {
            this.visibility[userID] = vis;
        }

        save(): any {
            var obj = {
                name: this.name,
                locationID: this.locationID,
                userID: this.userID,
                cards: [],
                visibility: this.visibility // ref
            };
            for (var i = 0; i < this.cards.length; ++i)
                obj.cards[i] = this.cards[i].save();
        }

        load(obj: any) {
            this.name = obj.name;
            this.locationID = obj.locationID;
            this.userID = obj.userID;
            this.cards.length = 0;
            this.visibility = obj.visibility; // ref

            for (var i = 0; i < obj.cards.length; ++i) {
                var card = new VCard(0);
                card.load(obj.cards[i]);
                this.cards[i] = card;
            }
        }
    }

    //-------------------------------------------
    export class VDeck {
        cards: VCard[] = [];
        backupCards: VCard[] = []; // these cards are used for a new game

        constructor(public name: string, public deckID: number) {}

        addCard(card: VCard) {
            this.cards.push(card);
            this.backupCards.push(card.clone());
        }

        containsCard(card: VCard) {
            return this.cards.indexOf(card) !== -1;
        }

        // bring all the cards into the game, cards are clone, so they don't modify the original
        playAllCards(location: VLocation) {
            for (var i = 0; i < this.cards.length; ++i) {
                this.cards[i].copy(this.backupCards[i]);
                location.insertCard(this.cards[i]);
            }
        }

        save(): any {
            var obj = {
                name: this.name,
                deckID: this.deckID,
                cards: []
            };
            for (var i = 0; i < this.cards.length; ++i)
                obj.cards.push(this.cards[i].save());
        }

        load(obj: any) {
            this.name = obj.name;
            this.deckID = obj.deckID;
            this.cards.length = 0;

            for (var i = 0; i < obj.cards.length; ++i) {
                var card = new VCard(0);
                card.load(obj.cards[i]);
                this.cards.push(card);
            }
        }
    }

    //-------------------------------------------
    export interface VGameObserver {
        newGame ? : () => void;
        commit ? : () => void;
        pick ? : < T > (name: string, userID: number, values: T[]) => T;
    }

    //-------------------------------------------
    export class VGame {
        private locationMap: {
            [locationID: number]: VLocation
        } = {};
        private deckMap: {
            [deckID: number]: VDeck
        } = {};
        private moveList: any[] = [];
        private players: number[] = []; // list of userID
        private roleCards: {
            [roleID: number]: VCard
        } = {};
        private variables: {
            [variable: string]: string
        } = {};
        private observer: VGameObserver = {
            newGame: () => {},
            commit: () => {},
            pick: < T > (name: string, userID: number, values: T[]) => {
                return null;
            }
        };
        private pickCache: {
            [name: string]: any
        } = {};

        BANK: number = 0; // unique id for the bank

        constructor(observer ? : VGameObserver) {
            if (observer) {
                for (var i in this.observer) {
                    if (observer[i])
                        this.observer[i] = observer[i];
                }
            }
        }

        createDeck(name: string, deckID: number): VDeck {
            var deck = new VDeck(name, deckID);
            this.deckMap[deckID] = deck;
            return deck;
        }

        createLocation(name: string, locationID: number, roleID: number): VLocation {
            var location = new VLocation(name, locationID, roleID);
            this.locationMap[locationID] = location;
            return location;
        }

        createCard(cardID: number, deck: VDeck): VCard {
            var card = new VCard(cardID);
            deck.addCard(card);
            return card;
        }

        addPlayer(userID: number) {
            this.players.push(userID);
        }

        removePlayer(userID: number) {
            var i = this.players.indexOf(userID);
            if (i === -1)
                return;

            this.players.splice(i, 1);
        }

        getNumPlayers(): number {
            return this.players.length;
        }

        setRoleCard(roleID: number, card: VCard) {
            this.roleCards[roleID] = card;
        }

        getLocationByID(locationID: number): VLocation {
            return this.locationMap[locationID];
        }

        getCardByID(cardID: number): VCard {
            for (var i in this.locationMap) {
                var card = this.locationMap[i].getCardByID(cardID);
                if (card)
                    return card;
            }
            return null;
        }

        getLocationByCard(card: VCard): VLocation {
            for (var i in this.locationMap) {
                if (this.locationMap[i].containsCard(card))
                    return this.locationMap[i];
            }
            return null;
        }

        getCardByLocation(location: VLocation, i: number, positionType: PositionType = PositionType.Top): VCard {
            return location.getCardByIndex(i, positionType);
        }

        // each role is a card, which may be given to a particular player.  getUserIDByCard()
        // can be used to find the player for a given role card
        getUserIDByCard(card: VCard): number {
            var location = this.getLocationByCard(card);
            if (!location)
                return -1;

            return location.userID;
        }

        // userID emcompasses both roleID and playerID.  During a game role may change but
        // player will not
        getVisibility(location: VLocation, roleID: number, playerID: number): Visibility {
            var roleVis = location.getVisibility(roleID);
            var playerVis = location.getVisibility(playerID);
            return Math.max(playerVis, roleVis);
        }

        getDeckByCard(card: VCard): VDeck {
            for (var i in this.deckMap) {
                if (this.deckMap[i].containsCard(card))
                    return this.deckMap[i];
            }
            return null;
        }

        recordMove(name: string, args: any) {
            this.moveList.push([name, args]);
        }

        boardElem: HTMLDivElement;
        printBoard() {
            if (!this.boardElem) {
                this.boardElem = document.createElement('div');
                this.boardElem.classList.add('Board');
                document.body.appendChild(this.boardElem);
            }

            var str = '';
            for (var i in this.locationMap) {
                var location = this.locationMap[i];
                var cards = location.getCards();
                str += location.name + ' = ' + cards.map((card) => {
                    return card.cardID
                }).join(' ') + ' (' + cards.length + ')<br/>';
            }
            this.boardElem.innerHTML = str;
        }

        // --- Commands ---
        newGame() {
            this.moveList.length = 0;
            this.recordMove('newGame', arguments);
            log('nameGame');

            for (var i in this.locationMap)
                this.locationMap[i].reset();

            this.variables = {};
        }

        shuffle(location: VLocation) {
            assert(location);
            this.recordMove('shuffle', arguments);
            log('shuffle ' + location.name);

            var cards = location.cards;
            var cardsLength = cards.length

            for (var i = 0; i < cardsLength; ++i) {
                var j = ~~ (Math.random() * cardsLength);
                this.swapCards(location, i, j);
            }
        }

        playDeck(deck: VDeck, location: VLocation) {
            assert(deck);
            assert(location);
            this.recordMove('playDeck', arguments);
            log('playDeck ' + deck.name + ' -> ' + location.name);

            deck.playAllCards(location);
        }

        moveCards(fromLocation: VLocation, fromIndex: number, count: number, toLocation: VLocation, toIndex: number) {
            assert(fromLocation);
            assert(toLocation);
            this.recordMove('moveCards', arguments);
            log('moveCards ' + fromLocation.name + ':' + fromIndex + '(' + count + ') -> ' + toLocation.name + ':' + toIndex);

            var numCards = Math.min(count, fromLocation.numCards);
            for (var i = 0; i < numCards; ++i) {
                var card = this.getCardByLocation(fromLocation, fromIndex);
                toLocation.insertCard(card, toIndex + i);
            }
        }

        moveCard(card: VCard, toLocation: VLocation) {
            assert(card);
            assert(toLocation);
            this.recordMove('moveCard', arguments);
            log('moveCard ' + card.cardID + ' -> ' + toLocation.name);

            toLocation.moveCard(card);
        }

        swapCards(location: VLocation, aIndex: number, bIndex: number) {
            this.recordMove('swapCards', arguments);
            log('swapCards ' + location.name + ':' + aIndex + ' -> ' + bIndex);

            location.swapCards(aIndex, bIndex);
        }

        setValues(card: VCard, values: {
            [key: string]: any
        }) {
            this.recordMove('setValues', arguments);

            for (var i in values) {
                card.values[i] = values[i];
            }
        }

        pick < T > (name: string, userID: number, values: T[]): T {
            this.recordMove('pick', arguments);
            log('pick [' + name + '] from ' + values.length + ' choices (' + userID + ')');

            var result = this.pickCache[name];
            if (typeof result === 'undefined') {
                if (userID === this.BANK) {
                    result = values[Math.floor(Math.random() * values.length)];
                } else {
                    result = this.observer.pick(name, userID, values);
                }
            }

            log('picked [' + name + '] = ' + result);
            return result;
        }

        commit(func: () => boolean): boolean {
            var result = func();
            if (result) {
                this.observer.commit();
                this.pickCache = {};
            }

            return result;
        }

        // --- Load/Save ---
        save(): any {
            var obj = {
                locationMap: {},
                deckMap: {},
                moveList: this.moveList, // ref
                players: this.players, // ref
            };

            for (var i in this.locationMap)
                obj.locationMap[i] = this.locationMap[i].save();

            for (var i in this.deckMap)
                obj.deckMap[i] = this.deckMap[i].save();

            return obj;
        }

        load(obj: any) {
            this.locationMap = {};
            this.moveList = obj.moveList; // ref
            this.players = obj.players; // ref

            for (var i in obj.locationMap) {
                var location = new VLocation('', 0, 0);
                location.load(obj.locationMap[i]);
                this.locationMap[i] = location;
            }

            for (var i in obj.deckMap) {
                var deck = new VDeck('', 0);
                deck.load(obj.deckMap[i]);
                this.deckMap[i] = deck;
            }
        }
    }
}
