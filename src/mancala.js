/// <reference path="virtualdeck.ts" />
/// <reference path="lazy.js.d.ts" />
/// <reference path="statemachine.ts" />
var Mancala;
(function (Mancala) {
    var observer = {
        pick: function (name, userID, values) {
            return values[Math.floor(Math.random() * values.length)];
        }
    };

    Lazy['Sequence'].define(['loop'], {
        getIterator: function () {
            var _this = this;
            return {
                parentIterator: null,
                index: -1,
                list: [],
                moveNext: function () {
                    return true;
                },
                current: function () {
                    if (!_this.parentIterator) {
                        _this.parentIterator = _this.parent.getIterator();
                        _this.list = [];
                        _this.index = -1;
                    }

                    ++_this.index;
                    if (_this.parentIterator.moveNext()) {
                        _this.list.push(_this.parentIterator.current());
                    } else {
                        _this.index = (_this.index % _this.list.length);
                    }

                    return _this.list[_this.index];
                }
            };
        }
    });

    var mancala = new VirtualDeck.VGame(observer);
    var id = 0;

    var numPlayers = 2;
    var pitsPerPlayer = 6;
    var stonesPerPit = 4;

    var playerA = 1;
    var playerB = 2;

    var stoneDeck = null;
    var stones = [];
    var pits = [];
    var stores = [];
    var chain = [];

    var currentPlayer = -1;
    var opponent = -1;

    var setup = {
        onEnter: function () {
            stoneDeck = mancala.createDeck('stoneDeck', ++id);
            var numStones = numPlayers * pitsPerPlayer * stonesPerPit;
            for (var i = 0; i < numStones; ++i)
                stones.push(mancala.createCard(++id, stoneDeck));

            stores[playerA] = mancala.createLocation('storeA', ++id, playerA);
            pits[playerA] = [];
            for (var i = 0; i < pitsPerPlayer; ++i)
                pits[playerA].push(mancala.createLocation('pA_' + i, ++id, playerA));

            stores[playerB] = mancala.createLocation('storeB', ++id, playerB);
            pits[playerB] = [];
            for (var i = 0; i < pitsPerPlayer; ++i)
                pits[playerB].push(mancala.createLocation('pB_' + i, ++id, playerB));

            chain[playerA] = [];
            chain[playerB] = [];
            chain[playerA].push.apply(chain[playerA], pits[playerA]);
            chain[playerA].push(stores[playerA]);
            chain[playerA].push.apply(chain[playerA], pits[playerB]);
            chain[playerB].push.apply(chain[playerB], pits[playerB]);
            chain[playerB].push(stores[playerB]);
            chain[playerB].push.apply(chain[playerB], pits[playerA]);

            // setup
            mancala.addPlayer(playerA);
            mancala.addPlayer(playerB);

            mancala.playDeck(stoneDeck, stores[playerA]);
        }
    };

    var newGame = {
        onEnter: function () {
            var k = 0;
            for (var i = 0; i < stonesPerPit; ++i) {
                for (var j = 0; j < pitsPerPlayer; ++j) {
                    mancala.moveCard(stones[k++], pits[playerA][j]);
                    mancala.moveCard(stones[k++], pits[playerB][j]);
                }
            }

            currentPlayer = mancala.pick('currentPlayer', mancala.BANK, [playerA, playerB]);
            opponent = (currentPlayer === playerA ? playerB : playerA);
            VirtualDeck.log('PLAYER: ' + currentPlayer);
        }
    };

    var turn = {
        onStep: function (root) {
            var pickedPit = mancala.pick('pickedPit', currentPlayer, pits[currentPlayer].filter(function (pit) {
                return pit.numCards > 0;
            }));
            if (pickedPit === null)
                return false;

            // rule 1. move all stones into subsequent pits
            var oldPit = null;
            var finalPit = null;
            var playerChain = chain[currentPlayer];

            Lazy(playerChain).loop().rest(playerChain.indexOf(pickedPit) + 1).first(pickedPit.numCards).each(function (pit) {
                mancala.moveCards(pickedPit, 0, 1, pit, 0);
                finalPit = pit;
            });

            var finalPitInStore = finalPit === stores[currentPlayer];

            // rule 2. if the final stone lands in an empty (non-store) pit, then the stones in the
            // opposite pit go to the player's store
            if (!finalPitInStore && finalPit.numCards === 1) {
                var i = pits[currentPlayer].indexOf(finalPit);
                if (i !== -1)
                    mancala.moveCards(pits[opponent][pitsPerPlayer - 1 - i], 0, 1e10, stores[currentPlayer], 0);
            }

            // rule 3. if final stone lands in the players store, then take another turn
            if (!finalPitInStore) {
                opponent = currentPlayer;
                currentPlayer = (currentPlayer === playerA ? playerB : playerA);
            }

            mancala.printBoard();
            return root.transition('nextTurn');
        },
        transitions: {
            nextTurn: function () {
                return turn;
            }
        }
    };

    Mancala.mancalaMachine = new StateMachine.StateChart().addState('setup', setup).addState('newGame', newGame).addState('turn', turn);
})(Mancala || (Mancala = {}));
