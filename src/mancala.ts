/// <reference path="virtualdeck.ts" />
module Mancala {
    var mancala = new VirtualDeck.VGame();
    var id = 0;

    // creation
    var pitsPerPlayer = 6;
    var stonesPerPit = 4;

    var playerA = 1;
    var playerB = 2;

    var stoneDeck = mancala.createDeck('stoneDeck', ++id);
    var stones: VirtualDeck.VCard[] = [];
    for (var i = 0; i < pitsPerPlayer * stonesPerPit; ++i)
        stones.push(mancala.createCard(++id, stoneDeck));

    var pits: VirtualDeck.VLocation[][] = [];
    var storeA = mancala.createLocation('storeA', ++id, playerA);
    pits[playerA] = [];
    for (var i = 0; i < pitsPerPlayer; ++i)
        pits[playerA].push(mancala.createLocation('pA_' + i, ++id, playerA));

    var storeB = mancala.createLocation('storeB', ++id, playerB);
    pits[playerB] = [];
    for (var i = 0; i < pitsPerPlayer; ++i)
        pits[playerB].push(mancala.createLocation('pB_' + i, ++id, playerB));

    var chain: VirtualDeck.VLocation[][] = [];
    chain[playerA] = [];
    chain[playerB] = [];
    chain[playerA] = ( < any > Array).concat.apply(pits[playerA], storeA, pits[playerB]);
    chain[playerB] = ( < any > Array).concat.apply(pits[playerB], storeB, pits[playerA]);

    // setup
    mancala.addPlayer(playerA);
    mancala.addPlayer(playerB);

    mancala.playDeck(stoneDeck, storeA);
    for (var i = 0; i < stonesPerPit; ++i) {
        mancala.moveCards(storeA, 0, pitsPerPlayer, pits[playerA][i], 0);
        mancala.moveCards(storeA, 0, pitsPerPlayer, pits[playerB][i], 0);
    }

    mancala.pickNumber(mancala.BANK, 'currentPlayer', [playerA, playerB]);

    // gameplay
    // var startPit = _pick(currentPlayer, _find(pits[currentPlayer], (i, pit) => _numCards(pit) > 0));
    // var pitChain = _chain(chain[currentPlayer], startPit);
    // _next(pitChain);
    // var lastPit = null;
    // _forEach(pitChain, _numCards(startPit), (i, pit) => _move(startPit, 1, 0, pit), lastPit = pit);

    // gameplaye
    mancala.moveCard(pits[playerA][2].getRandomCard(), pits[playerA][3]);
    mancala.moveCard(pits[playerA][2].getRandomCard(), pits[playerA][4]);
    mancala.moveCard(pits[playerA][2].getRandomCard(), pits[playerA][4]);
}
