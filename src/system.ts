module CustomDeck {
    var testStyle = document.createElement('div').style;
    var testTransform = getStyleFunction('Transform');

    function getStyleFunction(suffix: string): string {
        var lsuffix = suffix.substr(0, 1).toLowerCase() + suffix.substr(1);
        var test = [lsuffix, 'O' + suffix, 'ms' + suffix, 'Webkit' + suffix, 'Moz' + suffix];
        for (var i = 0; i < test.length; ++i) {
            if (test[i] in testStyle)
                return test[i];
        }
        return suffix;
    }

    export
    var setCSSTransform = function(style: CSSStyleDeclaration, value: string) {
        style[testTransform] = value;
    }

    export
    var uniqueID = 1;
}
