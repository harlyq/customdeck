
var Transform2D = (function () {
    function Transform2D() {
        this.angle = 0;
        this.sx = 1;
        this.sy = 1;
        this.tx = 0;
        this.ty = 0;
    }
    Transform2D.prototype.copy = function (other) {
        this.angle = other.angle;
        this.sx = other.sx;
        this.sy = other.sy;
        this.tx = other.tx;
        this.ty = other.ty;
        return this;
    };

    Transform2D.prototype.clone = function () {
        return new Transform2D().copy(this);
    };

    Transform2D.prototype.setTranslate = function (x, y) {
        this.tx = x;
        this.ty = y;
        return this;
    };

    Transform2D.prototype.setScale = function (sx, sy) {
        this.sx = sx;
        this.sy = sy;
        return this;
    };

    Transform2D.prototype.setRotate = function (angle) {
        this.angle = angle;
        return this;
    };

    Transform2D.prototype.translate = function (x, y) {
        this.tx += x;
        this.ty += y;
        return this;
    };

    Transform2D.prototype.scale = function (sx, sy) {
        this.sx *= sx;
        this.sy *= sy;
        return this;
    };

    Transform2D.prototype.rotate = function (angle) {
        this.angle += angle;
        return this;
    };

    Transform2D.prototype.multiply = function (other) {
        this.angle += other.angle;
        this.sx *= other.sx;
        this.sy *= other.sy;
        this.tx += other.tx;
        this.ty += other.ty;
        return this;
    };

    Transform2D.prototype.inverse = function () {
        this.angle = -this.angle;
        this.sx = 1 / this.sx;
        this.sy = 1 / this.sy;
        this.tx = -this.tx;
        this.ty = -this.ty;
        return this;
    };

    Transform2D.prototype.setIdentity = function () {
        this.angle = 0;
        this.sx = this.sy = 1;
        this.tx = this.ty = 0;
        return this;
    };

    Transform2D.prototype.draw = function (ctx) {
        var cos = Math.cos(this.angle);
        var sin = Math.sin(this.angle);
        ctx.transform(cos * this.sx, -sin * this.sy, sin * this.sx, cos * this.sy, this.tx, this.ty);
    };

    Transform2D.prototype.getLocal = function (x, y) {
        return {
            x: (x - this.tx) / this.sx,
            y: (y - this.ty) / this.sy
        };
    };

    Transform2D.prototype.getGlobal = function (lx, ly) {
        return {
            x: lx * this.sx + this.tx,
            y: ly * this.sy + this.ty
        };
    };

    Transform2D.prototype.toCSS = function () {
        var cos = Math.cos(this.angle);
        var sin = Math.sin(this.angle);
        return 'transform(' + (cos * this.sx).toString() + ',' + (-sin * this.sy).toString() + ',' + (sin * this.sx).toString() + ',' + (cos * this.sy).toString() + ',' + this.tx.toString() + ',' + this.ty.toString() + ')';
    };
    return Transform2D;
})();
var CustomDeck;
(function (CustomDeck) {
    var testStyle = document.createElement('div').style;
    var testTransform = getStyleFunction('Transform');

    function getStyleFunction(suffix) {
        var lsuffix = suffix.substr(0, 1).toLowerCase() + suffix.substr(1);
        var test = [lsuffix, 'O' + suffix, 'ms' + suffix, 'Webkit' + suffix, 'Moz' + suffix];
        for (var i = 0; i < test.length; ++i) {
            if (test[i] in testStyle)
                return test[i];
        }
        return suffix;
    }

    CustomDeck.setCSSTransform = function (style, value) {
        style[testTransform] = value;
    };

    CustomDeck.uniqueID = 1;
})(CustomDeck || (CustomDeck = {}));
/// <reference path="_dependencies.ts" />
var CustomDeck;
(function (CustomDeck) {
    'use strict';

    var Piece = (function () {
        function Piece() {
            this.transform = new Transform2D();
            this.width = 0;
            this.height = 0;
            this.id = CustomDeck.uniqueID++;
        }
        Piece.prototype.getTransform = function () {
            return this.transform;
        };

        Piece.prototype.save = function () {
            var obj = {
                id: this.id,
                width: this.width,
                height: this.height,
                transform: this.transform
            };
        };

        Piece.prototype.load = function (obj) {
            this.id = obj.id;
            this.width = obj.width;
            this.height = obj.height;
            this.transform.copy(obj.transform);
        };
        return Piece;
    })();
    CustomDeck.Piece = Piece;
})(CustomDeck || (CustomDeck = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="_dependencies.ts" />
var CustomDeck;
(function (CustomDeck) {
    'use strict';

    var CARD_CLASS = 'DeckCard';
    var CARD_SELECTED = 'DeckCardSelected';

    var Card = (function (_super) {
        __extends(Card, _super);
        function Card(root) {
            _super.call(this);
            this.root = root;

            if (!root.classList.contains(CARD_CLASS))
                root.classList.add(CARD_CLASS);

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            root.appendChild(this.canvas);

            this.width = 60;
            this.height = 80;
        }
        Card.prototype.rebuild = function () {
            this.canvas.width = this.width;
            this.canvas.height = this.height;

            var style = this.root.style;
            style.width = this.width + 'px';
            style.height = this.height + 'px';
            CustomDeck.setCSSTransform(style, this.getTransform().toCSS());
        };

        Card.prototype.save = function () {
            var obj = _super.prototype.save.call(this);
            obj.type = 'Card';
            return obj;
        };

        Card.prototype.load = function (obj) {
            if (obj.type !== 'Card')
                return;

            _super.prototype.load.call(this, obj);
        };
        return Card;
    })(CustomDeck.Piece);
    CustomDeck.Card = Card;
})(CustomDeck || (CustomDeck = {}));
/// <reference path="_dependencies.ts" />
var CustomDeck;
(function (CustomDeck) {
    'use strict';

    var CardManager = (function () {
        function CardManager() {
            this.cards = [];
        }
        CardManager.prototype.createCard = function () {
            return this.bindCard(document.createElement('div'));
        };

        // for testing
        CardManager.prototype.bindCard = function (elem) {
            var card = new CustomDeck.Card(elem);
            this.addCard(card);
            return card;
        };

        CardManager.prototype.addCard = function (card) {
            this.cards.push(card);
        };

        CardManager.prototype.removeCard = function (card) {
            var i = this.cards.indexOf(card);
            if (i !== -1)
                this.cards.splice(i, 1);
        };

        CardManager.prototype.save = function () {
            var obj = {
                type: 'CardManager',
                cards: []
            };
            for (var i = 0; i < this.cards.length; ++i)
                obj.cards.push(this.cards[i].save());

            return obj;
        };

        CardManager.prototype.load = function (obj) {
            if (obj.type !== 'CardManager')
                return;

            this.cards.length = 0;
            for (var i = 0; i < obj.cards.length; ++i) {
                var card = this.createCard();
                card.load(obj.cards[i]);
            }
        };
        return CardManager;
    })();
    CustomDeck.CardManager = CardManager;
    CustomDeck.g_cardManager = new CardManager();
})(CustomDeck || (CustomDeck = {}));
/// <reference path="_dependencies.ts" />
var CustomDeck;
(function (CustomDeck) {
    'use strict';

    var LOCATION_CLASS = 'DeckLocation';
    var LOCATION_SELECTED = 'DeckLocationSelected';

    (function (Layout) {
        Layout[Layout["Stack"] = 0] = "Stack";
        Layout[Layout["FanHorizontal"] = 1] = "FanHorizontal";
        Layout[Layout["FanVertical"] = 2] = "FanVertical";
        Layout[Layout["Random"] = 3] = "Random";
    })(CustomDeck.Layout || (CustomDeck.Layout = {}));
    var Layout = CustomDeck.Layout;

    (function (Visibility) {
        Visibility[Visibility["None"] = 0] = "None";
        Visibility[Visibility["FaceDown"] = 1] = "FaceDown";
        Visibility[Visibility["FaceUp"] = 2] = "FaceUp";
    })(CustomDeck.Visibility || (CustomDeck.Visibility = {}));
    var Visibility = CustomDeck.Visibility;

    var Location = (function (_super) {
        __extends(Location, _super);
        function Location(root) {
            _super.call(this);
            this.root = root;
            this.cards = [];
            this.layout = 0 /* Stack */;
            this.rebuildFunc = {};
            this.values = {};

            this.rebuildFunc[0 /* Stack */] = this.rebuildStack.bind(this);
            this.rebuildFunc[1 /* FanHorizontal */] = this.rebuildFanHorizontal.bind(this);
            this.rebuildFunc[2 /* FanVertical */] = this.rebuildFanVertical.bind(this);
            this.rebuildFunc[3 /* Random */] = this.rebuildRandom.bind(this);

            if (!root.classList.contains(LOCATION_CLASS))
                root.classList.add(LOCATION_CLASS);

            this.rebuild();
        }
        Location.prototype.addCard = function (card) {
            if (card.location)
                card.location.removeCard(card);

            this.cards.push(card);
            card.location = this;

            this.rebuild();
        };

        Location.prototype.removeCard = function (card) {
            if (card.location !== this)
                return;

            var i = this.cards.indexOf(card);
            if (i === -1)
                return;

            this.cards.splice(i, 1);
            card.location = null;
            this.rebuild();
        };

        Location.prototype.rebuild = function () {
            var style = this.root.style;
            style.width = this.width + 'px';
            style.height = this.height + 'px';
            CustomDeck.setCSSTransform(style, this.getTransform().toCSS());

            this.rebuildFunc[this.layout]();
        };

        Location.prototype.rebuildStack = function () {
            for (var i = 0; i < this.cards.length; ++i) {
                var card = this.cards[i];
                card.getTransform().copy(this.getTransform());
                card.rebuild();
            }
        };

        Location.prototype.rebuildFanHorizontal = function () {
        };

        Location.prototype.rebuildFanVertical = function () {
        };

        Location.prototype.rebuildRandom = function () {
            for (var i = 0; i < this.cards.length; ++i) {
                var card = this.cards[i];
                var x = Math.random() * Math.max(0, this.width - card.width);
                var y = Math.random() * Math.max(0, this.height - card.height);
                card.getTransform().setTranslate(x, y);
                card.rebuild();
            }
        };

        Location.prototype.save = function () {
            var obj = _super.prototype.save.call(this);
            obj.type = 'Location';
            obj.layout = this.layout;
        };

        Location.prototype.load = function (obj) {
            if (obj.type !== 'Location')
                return;

            this.layout = obj.layout;
        };
        return Location;
    })(CustomDeck.Piece);
    CustomDeck.Location = Location;
})(CustomDeck || (CustomDeck = {}));
/// <reference path="_dependencies.ts" />
var CustomDeck;
(function (CustomDeck) {
    'use strict';

    var LocationManager = (function () {
        function LocationManager() {
            this.locations = [];
        }
        LocationManager.prototype.createLocation = function () {
            return this.bindLocation(document.createElement('div'));
        };

        // for testing
        LocationManager.prototype.bindLocation = function (elem) {
            var location = new CustomDeck.Location(elem);
            this.addLocation(location);
            return location;
        };

        LocationManager.prototype.addLocation = function (location) {
            this.locations.push(location);
        };

        LocationManager.prototype.removeLocation = function (location) {
            var i = this.locations.indexOf(location);
            if (i !== -1)
                this.locations.splice(i, 1);
        };

        LocationManager.prototype.save = function () {
            var obj = {
                type: 'LocationManager',
                locations: []
            };
            for (var i = 0; i < this.locations.length; ++i)
                obj.locations.push(this.locations[i].save());
            return obj;
        };

        LocationManager.prototype.load = function (obj) {
            if (obj.type !== 'LocationManager')
                return;

            for (var i = 0; i < obj.locations.length; ++i) {
                var location = this.createLocation();
                location.load(obj.locations[i]);
            }
        };
        return LocationManager;
    })();
    CustomDeck.LocationManager = LocationManager;
    CustomDeck.g_locationManager = new LocationManager();
})(CustomDeck || (CustomDeck = {}));
/// <reference path="_dependencies.ts" />
var CustomDeck;
(function (CustomDeck) {
    'use strict';

    var GameManager = (function () {
        function GameManager() {
            this.roles = [];
            this.players = [];
        }
        GameManager.prototype.addRole = function (role) {
            this.roles.push(role);
        };

        GameManager.prototype.removeRole = function (role) {
            var i = this.roles.indexOf(role);
            if (i !== -1) {
                this.roles.splice(i, 1);
                this.clearAssign();
            }
        };

        GameManager.prototype.renameRole = function (i, role) {
            this.roles[i] = role;
            this.clearAssign();
        };

        GameManager.prototype.clearRoles = function () {
            this.roles.length = 0;
            this.clearAssign();
        };

        GameManager.prototype.getRoles = function () {
            return this.roles;
        };

        GameManager.prototype.getUnassignedRoles = function () {
            var unassigned = [];

            for (var i = 0; i < this.roles.length; ++i) {
                var role = this.roles[i];
                if (!this.rolePlayer[role])
                    unassigned.push(role);
            }

            return unassigned;
        };

        GameManager.prototype.addPlayer = function (player) {
            this.players.push(player);
        };

        GameManager.prototype.removePlayer = function (player) {
            var i = this.players.indexOf(player);
            if (i !== -1) {
                this.players.splice(i, 1);
                this.clearAssign();
            }
        };

        GameManager.prototype.renamePlayer = function (i, player) {
            this.players[i] = player;
            this.clearAssign();
        };

        GameManager.prototype.getPlayers = function () {
            return this.players;
        };

        GameManager.prototype.getNumPlayers = function () {
            return this.players.length;
        };

        GameManager.prototype.clearPlayers = function () {
            this.players.length = 0;
            this.clearAssign();
        };

        // must manually clear the assignment before re-assigning
        GameManager.prototype.assignRole = function (player, role) {
            this.playerRole[player] = role;
            this.rolePlayer[role] = player;
        };

        GameManager.prototype.clearAssign = function () {
            this.playerRole = {};
            this.rolePlayer = {};
        };

        GameManager.prototype.getRole = function (player) {
            return this.playerRole[player];
        };

        GameManager.prototype.getPlayer = function (role) {
            return this.rolePlayer[role];
        };

        GameManager.prototype.save = function () {
            return {
                type: 'GameManager',
                roles: this.roles,
                players: this.players
            };
        };

        GameManager.prototype.load = function (obj) {
            if (obj.type !== 'GameManager')
                return;

            this.clearPlayers();
            this.clearRoles();
            this.clearAssign();

            for (var i = 0; i < obj.roles.length; ++i)
                this.addRole(obj.roles[i]);

            for (var i = 0; i < obj.players.length; ++i)
                this.addPlayer(obj.players[i]);
        };
        return GameManager;
    })();
    CustomDeck.GameManager = GameManager;

    CustomDeck.g_gameManager = new GameManager();
})(CustomDeck || (CustomDeck = {}));
/// <reference path="transform2d.ts" />
/// <reference path="system.ts" />
/// <reference path="piece.ts" />
/// <reference path="card.ts" />
/// <reference path="cardmanager.ts" />
/// <reference path="location.ts" />
/// <reference path="locationmanager.ts" />
/// <reference path="gamemanager.ts" />
/// <reference path="_dependencies.ts" />
var CustomDeck;
(function (CustomDeck) {
    CustomDeck.bindLocations = function (locationElems) {
        for (var i = 0; i < locationElems.length; ++i) {
            CustomDeck.g_locationManager.bindLocation(locationElems[i]);
        }
    };

    CustomDeck.bindCards = function (cardElems) {
        for (var i = 0; i < cardElems.length; ++i) {
            CustomDeck.g_cardManager.bindCard(cardElems[i]);
        }
    };
})(CustomDeck || (CustomDeck = {}));
