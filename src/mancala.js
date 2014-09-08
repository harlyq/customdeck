/// <reference path="virtualdeck.ts" />
/// <reference path="lazy.js.d.ts" />
var Mancala;
(function (Mancala) {
    var mancala = new VirtualDeck.VGame();
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

    Mancala.setup = function () {
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
    };

    // HACK - put this in lazy.js.d.ts
    // module LazyJS {
    //     interface Sequence < T > {
    //         loop(): Sequence < T > ;
    //     }
    // }
    // gameplay
    // var startPit = _pick(currentPlayer, _find(pits[currentPlayer], (i, pit) => _numCards(pit) > 0));
    // var pitChain = _chain(chain[currentPlayer], startPit);
    // _next(pitChain);
    // var lastPit = null;
    // _forEach(pitChain, _numCards(startPit), (i, pit) => _move(startPit, 1, 0, pit), lastPit = pit);
    // gameplaye
    // mancala.moveCard(pits[playerA][2].getRandomCard(), pits[playerA][3]);
    // mancala.moveCard(pits[playerA][2].getRandomCard(), pits[playerA][4]);
    // mancala.moveCard(pits[playerA][2].getRandomCard(), pits[playerA][4]);
    Mancala.newGame = function () {
        var k = 0;
        for (var i = 0; i < stonesPerPit; ++i) {
            for (var j = 0; j < pitsPerPlayer; ++j) {
                mancala.moveCard(stones[k++], pits[playerA][j]);
                mancala.moveCard(stones[k++], pits[playerB][j]);
            }
        }

        currentPlayer = mancala.pick(mancala.BANK, [playerA, playerB]);
        opponent = (currentPlayer === playerA ? playerB : playerA);
        VirtualDeck.log('PLAYER: ' + currentPlayer);
    };

    var currentPlayer = null;
    var opponent = null;

    Mancala.nextTurn = function () {
        var pickedPit = mancala.pick(currentPlayer, pits[currentPlayer].filter(function (pit) {
            return pit.numCards > 0;
        }));

        // rule 1. move all stones into subsequent pits
        var oldPit = null;
        var finalPit = null;

        Lazy(chain[currentPlayer]).loop().dropWhile(function (pit) {
            var result = oldPit !== pickedPit;
            oldPit = pit;
            return result;
        }).first(pickedPit.numCards).each(function (pit) {
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

        return true;
    };
})(Mancala || (Mancala = {}));
