/*export*/
class CardLayout {
    private _func: {
        [style: number]: (index: number, count: number, options: CardLayout.Options) => number
    } = {};
    private options: CardLayout.Options = {};
    private transformKeyword: string = '';

    constructor(options: CardLayout.Options) {
        var thisOptions = this.options;
        thisOptions.style = CardLayout.Style.Stack;
        thisOptions.maxSpacing = 1;
        thisOptions.align = CardLayout.Align.Center;
        thisOptions.rotate = 0;
        thisOptions.offsetX = 0;
        thisOptions.offsetY = 0;
        thisOptions.element = null;
        thisOptions.top = 0;
        thisOptions.left = 0;
        thisOptions.width = 1;
        thisOptions.height = 1;
        thisOptions.cardWidth = 20;
        thisOptions.cardHeight = 20;

        var element = options.element;
        if (element) {
            thisOptions.width = element.offsetWidth;
            thisOptions.height = element.offsetHeight;
            thisOptions.left = element.offsetLeft;
            thisOptions.top = element.offsetTop;
        }

        for (var i in options)
            this.options[i] = options[i];

        this.define(CardLayout.Style.Fan, CardLayout.getFan);
        this.define(CardLayout.Style.Stack, CardLayout.getStack);
        this.define(CardLayout.Style.Random, CardLayout.getRandom);

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

    // func returns a number in the range 0 (left-most) to 1 (right-most)
    define(style: number,
        func: (index: number, count: number, options: CardLayout.Options) => number) {
        this._func[style] = func;
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
            var left = this.getLeft(i, numCards, card.offsetWidth) - options.left;
            var top = this.getTop(i, numCards, card.offsetHeight) - options.top;

            card.style.position = 'absolute';
            card.style[this.transformKeyword] = 'translate(' + left + 'px,' + top + 'px)';
        }
    }

    getIndex(x: number, y: number, layoutElem: HTMLElement, cards ? : any): number {
        return 0;
    }

    getLeft(index: number, count: number, cardWidth ? : number) {
        var options = this.options;
        if (typeof cardWidth === 'undefined')
            cardWidth = options.cardWidth;

        return (this.getX(index, count) + 1) * (options.width - cardWidth) / 2 + index * options.offsetX + options.left;
    }

    getTop(index: number, count: number, cardHeight ? : number) {
        var options = this.options;
        if (typeof cardHeight === 'undefined')
            cardHeight = options.cardHeight;

        return (this.getY(index, count) + 1) * (options.height - cardHeight) / 2 + index * options.offsetY + options.top;
    }

    getInverseTopLeft(top: number, left: number, count: number, cardWidth: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number): number {
        return 0;
    }

    getX(index: number, count: number): number {
        var options = this.options;
        var rad = options.rotate / 180 * Math.PI;
        var r = this._func[options.style](index, count, options);
        return r * Math.cos(rad);
    }

    getY(index: number, count: number): number {
        var options = this.options;
        var rad = options.rotate / 180 * Math.PI;
        var r = this._func[options.style](index, count, options);
        return r * Math.sin(rad);
    }

    getInverseXY(x: number, y: number, count: number): number {
        return 0;
    }

    static getStack(index, count, options): number {
        switch (options.align) {
            case CardLayout.Align.Left:
                return -1;
                break;
            case CardLayout.Align.Center:
                return 0;
                break;
            case CardLayout.Align.Right:
                return 1;
                break;
        }
    }

    static getFan(index, count, options): number {
        var delta = Math.min(options.maxSpacing, (count > 1 ? 2 / (count - 1) : 0));

        switch (options.align) {
            case CardLayout.Align.Left:
                return index * delta;
                break;
            case CardLayout.Align.Center:
                return (index - (count - 1) / 2) * delta;
                break;
            case CardLayout.Align.Right:
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
    export interface Options {
        style ? : Style;
        maxSpacing ? : number; // (0,1) used by Fan
        align ? : Align;
        rotate ? : number;
        offsetX ? : number;
        offsetY ? : number;
        element ? : HTMLElement;
        top ? : number;
        left ? : number;
        width ? : number;
        height ? : number;
        cardWidth ? : number;
        cardHeight ? : number;
    }

    export enum Style {
        Stack, Fan, Random
    }

    export enum Align {
        Left, Center, Right
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
