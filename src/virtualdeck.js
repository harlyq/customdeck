var VirtualDeck;
(function (VirtualDeck) {
    // playerID = 1..numPlayers
    // roleID == playerID or roleID > playerID
    // userID == (playerID or roleID)
    VirtualDeck.assert = function (cond) {
        if (!cond)
            debugger;
    };

    var logElem;

    VirtualDeck.log = function (msg) {
        if (!logElem) {
            logElem = document.createElement('div');
            logElem.classList.add('Log');
            document.body.appendChild(logElem);
        }

        msg += '<br/>' + logElem.innerHTML;
        logElem.innerHTML = msg;
    };

    function clamp(val, max, min) {
        if (val < min)
            return min;
        else if (val > max)
            return max;
        else
            return val;
    }

    //-------------------------------------------
    // secret is used when no details are known, not even the quantity
    (function (Visibility) {
        Visibility[Visibility["Secret"] = 0] = "Secret";
        Visibility[Visibility["None"] = 1] = "None";
        Visibility[Visibility["Top"] = 2] = "Top";
        Visibility[Visibility["All"] = 3] = "All";
    })(VirtualDeck.Visibility || (VirtualDeck.Visibility = {}));
    var Visibility = VirtualDeck.Visibility;
    ;

    //-------------------------------------------
    (function (PositionType) {
        PositionType[PositionType["Top"] = 0] = "Top";
        PositionType[PositionType["Bottom"] = 1] = "Bottom";
        PositionType[PositionType["Random"] = 2] = "Random";
    })(VirtualDeck.PositionType || (VirtualDeck.PositionType = {}));
    var PositionType = VirtualDeck.PositionType;

    //-------------------------------------------
    var VCard = (function () {
        function VCard(cardID) {
            this.cardID = cardID;
            this.location = null;
            this.values = {};
        }
        VCard.prototype.copy = function (other) {
            this.location = other.location;
            this.cardID = other.cardID;

            for (var i in other.values)
                this.values[i] = other.values[i];

            return this;
        };

        VCard.prototype.clone = function () {
            var card = new VCard(this.cardID);
            return card.copy(this);
        };

        VCard.prototype.save = function () {
            return {
                cardID: this.cardID,
                values: this.values
            };
        };

        VCard.prototype.load = function (obj) {
            this.cardID = obj.cardID;
            this.values = obj.values; // ref
        };
        return VCard;
    })();
    VirtualDeck.VCard = VCard;

    //-------------------------------------------
    var VLocation = (function () {
        function VLocation(name, locationID, userID) {
            this.name = name;
            this.locationID = locationID;
            this.userID = userID;
            this.cards = [];
            this.visibility = {};
            this.addTo = 0 /* Top */;
        }
        Object.defineProperty(VLocation.prototype, "numCards", {
            get: function () {
                return this.cards.length;
            },
            enumerable: true,
            configurable: true
        });

        VLocation.prototype.getCards = function () {
            return this.cards;
        };

        VLocation.prototype.getCardByID = function (cardID) {
            for (var i = 0; i < this.cards.length; ++i) {
                if (this.cards[i].cardID === cardID)
                    return this.cards[i];
            }
            return null;
        };

        VLocation.prototype.getCardByIndex = function (i, positionType) {
            if (typeof positionType === "undefined") { positionType = 0 /* Top */; }
            switch (positionType) {
                case 0 /* Top */:
                    i = this.cards.length - i;
                    break;

                case 2 /* Random */:
                    i = ~~Math.random() * this.cards.length;
                    break;
            }

            return this.cards[clamp(i, 0, this.cards.length)];
        };

        VLocation.prototype.getTopCard = function () {
            return this.cards[this.cards.length - 1];
        };

        VLocation.prototype.getBottomCard = function () {
            return this.cards[0];
        };

        VLocation.prototype.getRandomCard = function () {
            return this.cards[Math.random() * this.cards.length];
        };

        VLocation.prototype.containsCard = function (card) {
            return this.cards.indexOf(card) !== -1;
        };

        VLocation.prototype.insertCard = function (card, i) {
            if (typeof i === "undefined") { i = 1e10; }
            if (card.location)
                card.location.removeCard(card);

            this.cards.splice(i, 0, card);
            card.location = this;
        };

        VLocation.prototype.removeCard = function (card) {
            if (card.location !== this)
                return;

            var i = this.cards.indexOf(card);
            if (i === -1)
                return;

            card.location = null;
            this.cards.splice(i, 1);
        };

        VLocation.prototype.moveCard = function (card) {
            if (card.location)
                card.location.removeCard(card);

            switch (this.addTo) {
                case 0 /* Top */:
                    this.insertCard(card);
                    break;
                case 1 /* Bottom */:
                    this.insertCard(card, 0);
                    break;
                case 2 /* Random */:
                    this.insertCard(card, Math.floor(Math.random() * this.cards.length));
                    break;
            }
        };

        VLocation.prototype.reset = function () {
            for (var i = 0; i < this.cards.length; ++i)
                this.cards[i].location = null;

            this.cards.length = 0;
        };

        VLocation.prototype.swapCards = function (i, j) {
            var card = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = card;
        };

        VLocation.prototype.getVisibility = function (userID) {
            return this.visibility[userID];
        };

        VLocation.prototype.setVisibility = function (userID, vis) {
            this.visibility[userID] = vis;
        };

        VLocation.prototype.save = function () {
            var obj = {
                name: this.name,
                locationID: this.locationID,
                userID: this.userID,
                cards: [],
                visibility: this.visibility
            };
            for (var i = 0; i < this.cards.length; ++i)
                obj.cards[i] = this.cards[i].save();
        };

        VLocation.prototype.load = function (obj) {
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
        };
        return VLocation;
    })();
    VirtualDeck.VLocation = VLocation;

    //-------------------------------------------
    var VDeck = (function () {
        function VDeck(name, deckID) {
            this.name = name;
            this.deckID = deckID;
            this.cards = [];
            this.backupCards = [];
        }
        VDeck.prototype.addCard = function (card) {
            this.cards.push(card);
            this.backupCards.push(card.clone());
        };

        VDeck.prototype.containsCard = function (card) {
            return this.cards.indexOf(card) !== -1;
        };

        // bring all the cards into the game, cards are clone, so they don't modify the original
        VDeck.prototype.playAllCards = function (location) {
            for (var i = 0; i < this.cards.length; ++i) {
                this.cards[i].copy(this.backupCards[i]);
                location.insertCard(this.cards[i]);
            }
        };

        VDeck.prototype.save = function () {
            var obj = {
                name: this.name,
                deckID: this.deckID,
                cards: []
            };
            for (var i = 0; i < this.cards.length; ++i)
                obj.cards.push(this.cards[i].save());
        };

        VDeck.prototype.load = function (obj) {
            this.name = obj.name;
            this.deckID = obj.deckID;
            this.cards.length = 0;

            for (var i = 0; i < obj.cards.length; ++i) {
                var card = new VCard(0);
                card.load(obj.cards[i]);
                this.cards.push(card);
            }
        };
        return VDeck;
    })();
    VirtualDeck.VDeck = VDeck;

    

    //-------------------------------------------
    var VGame = (function () {
        function VGame(observer) {
            this.locationMap = {};
            this.deckMap = {};
            this.moveList = [];
            this.players = [];
            this.roleCards = {};
            this.variables = {};
            this.observer = {
                newGame: function () {
                },
                commit: function () {
                },
                pick: function (name, userID, values) {
                    return null;
                }
            };
            this.pickCache = {};
            this.BANK = 0;
            if (observer) {
                for (var i in this.observer) {
                    if (observer[i])
                        this.observer[i] = observer[i];
                }
            }
        }
        VGame.prototype.createDeck = function (name, deckID) {
            var deck = new VDeck(name, deckID);
            this.deckMap[deckID] = deck;
            return deck;
        };

        VGame.prototype.createLocation = function (name, locationID, roleID) {
            var location = new VLocation(name, locationID, roleID);
            this.locationMap[locationID] = location;
            return location;
        };

        VGame.prototype.createCard = function (cardID, deck) {
            var card = new VCard(cardID);
            deck.addCard(card);
            return card;
        };

        VGame.prototype.addPlayer = function (userID) {
            this.players.push(userID);
        };

        VGame.prototype.removePlayer = function (userID) {
            var i = this.players.indexOf(userID);
            if (i === -1)
                return;

            this.players.splice(i, 1);
        };

        VGame.prototype.getNumPlayers = function () {
            return this.players.length;
        };

        VGame.prototype.setRoleCard = function (roleID, card) {
            this.roleCards[roleID] = card;
        };

        VGame.prototype.getLocationByID = function (locationID) {
            return this.locationMap[locationID];
        };

        VGame.prototype.getCardByID = function (cardID) {
            for (var i in this.locationMap) {
                var card = this.locationMap[i].getCardByID(cardID);
                if (card)
                    return card;
            }
            return null;
        };

        VGame.prototype.getLocationByCard = function (card) {
            for (var i in this.locationMap) {
                if (this.locationMap[i].containsCard(card))
                    return this.locationMap[i];
            }
            return null;
        };

        VGame.prototype.getCardByLocation = function (location, i, positionType) {
            if (typeof positionType === "undefined") { positionType = 0 /* Top */; }
            return location.getCardByIndex(i, positionType);
        };

        // each role is a card, which may be given to a particular player.  getUserIDByCard()
        // can be used to find the player for a given role card
        VGame.prototype.getUserIDByCard = function (card) {
            var location = this.getLocationByCard(card);
            if (!location)
                return -1;

            return location.userID;
        };

        // userID emcompasses both roleID and playerID.  During a game role may change but
        // player will not
        VGame.prototype.getVisibility = function (location, roleID, playerID) {
            var roleVis = location.getVisibility(roleID);
            var playerVis = location.getVisibility(playerID);
            return Math.max(playerVis, roleVis);
        };

        VGame.prototype.getDeckByCard = function (card) {
            for (var i in this.deckMap) {
                if (this.deckMap[i].containsCard(card))
                    return this.deckMap[i];
            }
            return null;
        };

        VGame.prototype.recordMove = function (name, args) {
            this.moveList.push([name, args]);
        };

        VGame.prototype.printBoard = function () {
            if (!this.boardElem) {
                this.boardElem = document.createElement('div');
                this.boardElem.classList.add('Board');
                document.body.appendChild(this.boardElem);
            }

            var str = '';
            for (var i in this.locationMap) {
                var location = this.locationMap[i];
                var cards = location.getCards();
                str += location.name + ' = ' + cards.map(function (card) {
                    return card.cardID;
                }).join(' ') + ' (' + cards.length + ')<br/>';
            }
            this.boardElem.innerHTML = str;
        };

        // --- Commands ---
        VGame.prototype.newGame = function () {
            this.moveList.length = 0;
            this.recordMove('newGame', arguments);
            VirtualDeck.log('nameGame');

            for (var i in this.locationMap)
                this.locationMap[i].reset();

            this.variables = {};
        };

        VGame.prototype.shuffle = function (location) {
            VirtualDeck.assert(location);
            this.recordMove('shuffle', arguments);
            VirtualDeck.log('shuffle ' + location.name);

            var cards = location.cards;
            var cardsLength = cards.length;

            for (var i = 0; i < cardsLength; ++i) {
                var j = ~~(Math.random() * cardsLength);
                this.swapCards(location, i, j);
            }
        };

        VGame.prototype.playDeck = function (deck, location) {
            VirtualDeck.assert(deck);
            VirtualDeck.assert(location);
            this.recordMove('playDeck', arguments);
            VirtualDeck.log('playDeck ' + deck.name + ' -> ' + location.name);

            deck.playAllCards(location);
        };

        VGame.prototype.moveCards = function (fromLocation, fromIndex, count, toLocation, toIndex) {
            VirtualDeck.assert(fromLocation);
            VirtualDeck.assert(toLocation);
            this.recordMove('moveCards', arguments);
            VirtualDeck.log('moveCards ' + fromLocation.name + ':' + fromIndex + '(' + count + ') -> ' + toLocation.name + ':' + toIndex);

            var numCards = Math.min(count, fromLocation.numCards);
            for (var i = 0; i < numCards; ++i) {
                var card = this.getCardByLocation(fromLocation, fromIndex);
                toLocation.insertCard(card, toIndex + i);
            }
        };

        VGame.prototype.moveCard = function (card, toLocation) {
            VirtualDeck.assert(card);
            VirtualDeck.assert(toLocation);
            this.recordMove('moveCard', arguments);
            VirtualDeck.log('moveCard ' + card.cardID + ' -> ' + toLocation.name);

            toLocation.moveCard(card);
        };

        VGame.prototype.swapCards = function (location, aIndex, bIndex) {
            this.recordMove('swapCards', arguments);
            VirtualDeck.log('swapCards ' + location.name + ':' + aIndex + ' -> ' + bIndex);

            location.swapCards(aIndex, bIndex);
        };

        VGame.prototype.setValues = function (card, values) {
            this.recordMove('setValues', arguments);

            for (var i in values) {
                card.values[i] = values[i];
            }
        };

        VGame.prototype.pick = function (name, userID, values) {
            this.recordMove('pick', arguments);
            VirtualDeck.log('pick [' + name + '] from ' + values.length + ' choices (' + userID + ')');

            var result = this.pickCache[name];
            if (typeof result === 'undefined') {
                if (userID === this.BANK) {
                    result = values[Math.floor(Math.random() * values.length)];
                } else {
                    result = this.observer.pick(name, userID, values);
                }
            }

            VirtualDeck.log('picked [' + name + '] = ' + result);
            return result;
        };

        VGame.prototype.commit = function (func) {
            var result = func();
            if (result) {
                this.observer.commit();
                this.pickCache = {};
            }

            return result;
        };

        // --- Load/Save ---
        VGame.prototype.save = function () {
            var obj = {
                locationMap: {},
                deckMap: {},
                moveList: this.moveList,
                players: this.players
            };

            for (var i in this.locationMap)
                obj.locationMap[i] = this.locationMap[i].save();

            for (var i in this.deckMap)
                obj.deckMap[i] = this.deckMap[i].save();

            return obj;
        };

        VGame.prototype.load = function (obj) {
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
        };
        return VGame;
    })();
    VirtualDeck.VGame = VGame;
})(VirtualDeck || (VirtualDeck = {}));
