/// <reference path="greensock.d.ts" />
/*export*/
class CardLayout {
    private _func: {
        [layout: string]: (index: number, count: number, options: CardLayout.Options) => number
    } = {};
    private options: CardLayout.Options = {};
    private transformKeyword: string = '';

    constructor(options: CardLayout.Options) {
        var thisOptions = this.options;
        thisOptions.layout = 'left';
        thisOptions.maxspacing = 1;
        thisOptions.align = 'center';
        thisOptions.rotate = 0;
        thisOptions.offsetx = 0;
        thisOptions.offsety = 0;
        thisOptions.element = null;
        thisOptions.top = 0;
        thisOptions.left = 0;
        thisOptions.width = 1;
        thisOptions.height = 1;

        this.setOptions(options);

        this.define('fan', CardLayout.getFan);
        this.define('stack', CardLayout.getStack);
        this.define('random', CardLayout.getRandom);

        var elem = document.createElement('div');
        var transformStrings = ['transform', 'OTransform', 'webkitTransform', 'MozTransform', 'msTransform'];
        for (var j = 0; j < transformStrings.length; ++j) {
            if (transformStrings[j] in elem.style) {
                this.transformKeyword = transformStrings[j];
                break;
            }
        }
        this.transformKeyword = 'webkitTransform';
    }

    setOptions(options: CardLayout.Options) {
        var thisOptions = this.options;
        var element = options.element;

        if (element) {
            thisOptions.width = element.offsetWidth;
            thisOptions.height = element.offsetHeight;
            thisOptions.left = element.offsetLeft;
            thisOptions.top = element.offsetTop;
        }

        for (var i in options)
            thisOptions[i] = options[i];
    }

    // func returns a number in the range 0 (left-most) to 1 (right-most)
    define(layout: string,
        func: (index: number, count: number, options: CardLayout.Options) => number) {
        this._func[layout] = func;
    }

    position(cards ? : any) {
        var options = this.options;
        if (typeof cards === 'undefined')
            cards = options.element.children;

        var numCards = cards.length;
        for (var i = 0; i < numCards; ++i) {
            var card = cards[i];
            var left = this.getLeft(i, numCards, card.offsetWidth);
            var top = this.getTop(i, numCards, card.offsetHeight);

            card.style.position = 'absolute';
            card.style.left = left + 'px';
            card.style.top = top + 'px';
        }
    }

    translate(cards ? : any) {
        var options = this.options;
        if (typeof cards === 'undefined')
            cards = options.element.children;

        var numCards = cards.length;
        for (var i = 0; i < numCards; ++i) {
            var card = cards[i];
            var left = this.getLeft(i, numCards, card.offsetWidth); // - options.left;
            var top = this.getTop(i, numCards, card.offsetHeight); // - options.top;

            //card.style.position = 'absolute';
            card.style[this.transformKeyword] = 'translate(' + left + 'px,' + top + 'px)';
        }
    }

    animate(duration: number, cards ? : any) {
        var options = this.options;
        if (typeof cards === 'undefined')
            cards = options.element.children;

        var numCards = cards.length;
        for (var i = 0; i < numCards; ++i) {
            var card = cards[i];
            var left = this.getLeft(i, numCards, card.offsetWidth); // - options.left;
            var top = this.getTop(i, numCards, card.offsetHeight); // - options.top;

            card.style.position = 'absolute';
            TweenMax.to(card, duration, {
                left: left + 'px',
                top: top + 'px'
            });
        }
    }

    getIndex(x: number, y: number, layoutElem: HTMLElement, cards ? : any): number {
        return 0;
    }

    getLeft(index: number, count: number, cardwidth: number) {
        var options = this.options;
        return (this.getX(index, count) + 1) * (options.width - cardwidth) / 2 + index * options.offsetx; // + options.left;
    }

    getTop(index: number, count: number, cardheight: number) {
        var options = this.options;
        return (this.getY(index, count) + 1) * (options.height - cardheight) / 2 + index * options.offsety; // + options.top;
    }

    getInverseTopLeft(top: number, left: number, count: number, cardwidth: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number): number {
        return 0;
    }

    getX(index: number, count: number): number {
        var options = this.options;
        var rad = options.rotate / 180 * Math.PI;
        var r = this._func[options.layout](index, count, options);
        return r * Math.cos(rad);
    }

    getY(index: number, count: number): number {
        var options = this.options;
        var rad = options.rotate / 180 * Math.PI;
        var r = this._func[options.layout](index, count, options);
        return r * Math.sin(rad);
    }

    getInverseXY(x: number, y: number, count: number): number {
        return 0;
    }

    static getStack(index, count, options): number {
        switch (options.align) {
            case 'left':
                return -1;
                break;
            case 'center':
                return 0;
                break;
            case 'right':
                return 1;
                break;
        }
    }

    static getFan(index, count, options): number {
        var delta = Math.min(options.maxspacing, (count > 1 ? 2 / (count - 1) : 0));

        switch (options.align) {
            case 'left':
                return index * delta;
                break;
            case 'center':
                return (index - (count - 1) / 2) * delta;
                break;
            case 'right':
                return 1 - (count - 1 - index) * delta;
                break;
        }
    }

    static getRandom(index, count, options): number {
        return (Math.random() - 0.5) * 2;
    }
}

/*export*/
module CardLayout {
    // all lowercase as these can be set directly as options
    export interface Options {
        layout ? : string; // stack, fan, random
        maxspacing ? : number; // (0,1) used by fan
        align ? : string; // left, center, right
        rotate ? : number;
        offsetx ? : number;
        offsety ? : number;
        element ? : HTMLElement;
        top ? : number;
        left ? : number;
        width ? : number;
        height ? : number;
    }

    interface TopLeft {
        top: number;
        left: number;
    }

    interface XY {
        x: number;
        y: number;
    }
}

var CardLayoutPrototype = Object.create(HTMLElement.prototype);

CardLayoutPrototype.createdCallback = function() {
    this.options = {
        element: this
    };

    var self = this;
    [].forEach.call(this.attributes, function(attr) {
        self.options[attr.name] = attr.value;
    });
};

CardLayoutPrototype.attachedCallback = function() {
    this.cardLayout = new CardLayout(this.options);
};

CardLayoutPrototype.detachedCallback = function() {
    this.cardLayout = null;
}

CardLayoutPrototype.attributeChangedCallback = function(attrName, oldVal, newVal) {
    this.options[attrName] = newVal;

    if (this.cardLayout) {
        this.cardLayout.setOptions(this.options);
        this.cardLayout.position();
    }
}

CardLayoutPrototype.positionCards = function(cards ? : any) {
    if (this.cardLayout)
        this.cardLayout.position(cards);
}

CardLayoutPrototype.animateCards = function(cards ? : any) {
    if (this.cardLayout)
        this.cardLayout.animate(cards);
}

CardLayoutPrototype.appendChild = function(newElement: Node) {
    HTMLElement.prototype.appendChild.call(this, newElement);
    if (this.cardLayout)
        this.cardLayout.position();
}

CardLayoutPrototype.removeChild = function(oldElement: Node) {
    HTMLElement.prototype.removeChild.call(this, oldElement);
    if (this.cardLayout)
        this.cardLayout.position();
}

CardLayoutPrototype.insertBefore = function(newElement: Node, referenceElement: Node) {
    HTMLElement.prototype.insertBefore.call(this, newElement, referenceElement);
    if (this.cardLayout)
        this.cardLayout.position();
}

CardLayoutPrototype.replaceChild = function(newElement: Node, oldElement: Node) {
    HTMLElement.prototype.replaceChild.call(this, newElement, oldElement);
    if (this.cardLayout)
        this.cardLayout.position();
}

interface Document {
    registerElement(elementName: string, options: any);
}

if ('registerElement' in document) {
    document.registerElement('card-layout', {
        prototype: CardLayoutPrototype
    });
}
