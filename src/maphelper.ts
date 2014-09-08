module MapHelper {

    export declare
    var Map: {
        new < K, V > (iterable ? : any): Map < K,
        V > ;
    }

    export interface Map < K, V > {
        clear(): void;
        delete(key: K): boolean;
        forEach(callbackfn: (value: V, index: K, map: Map < K, V > ) => void, thisArg ? : any): void;
        get(key: K): V;
        has(key: K): boolean;
        set(key: K, value: V): Map < K,
        V > ;
        size: number;
        values: V[];
        keys: K[];
    }

    //-----------------------
    var bestKey;
    var bestValue;
    var first = true;

    var minBest = function(value, key) {
        if (first || value < bestValue) {
            bestValue = value;
            bestKey = key;
            first = false;
        }
    }

    var maxBest = function(value, key) {
        if (first || value > bestValue) {
            bestValue = value;
            bestKey = key;
            first = false;
        }
    }

    var findBest = function(map: Map < any, any > , bestFunc): Map < any,
        any > {
            var bestValue;
            var bestKey;
            var first = true;

            map.forEach(bestFunc);

            return Map([
                [bestKey, bestValue]
            ]);
        }

    //-----------------------
    var allValue = 0;
    var sumAll = function(value, key) {
        allValue += parseFloat(value);
    }

    var productAll = function(value, key) {
        allValue *= parseFloat(value);
    }

    var calcAll = function(map: Map < any, any > , allFunc): number {
        var allValue = 0;
        map.forEach(allFunc);
        return allValue;
    }

    //-----------------------
    export
    var minimum = function < U,
        K > (map: Map < U, K > ): Map < U,
        K > {
            return findBest(map, minBest);
        }

    export
    var maximum = function < U,
        K > (map: Map < U, K > ): Map < U,
        K > {
            return findBest(map, minBest);
        }

    export
    var sum = function(map: Map < any, any > ): number {
        allValue = 0;
        calcAll(map, sumAll);
        return allValue;
    }

    export
    var product = function(map: Map < any, any > ): number {
        allValue = 0;
        calcAll(map, productAll);
        return allValue;
    }

    export
    var average = function(map: Map < any, any > ): number {
        if (map.size == 0)
            return undefined;

        allValue = 0;
        calcAll(map, sumAll);
        return allValue / map.size;
    }

    export
    var all = function < K,
        V > (map: Map < K, V > , test: (key: K, value: V, map ? : Map < K, V > ) => boolean) {
            if (map.size === 0)
                return false;

            for (var key in map.keys) {
                if (!test(key, map.get(key), map))
                    return false;
            }

            return true;
        }

    export
    var some = function < K,
        V > (map: Map < K, V > , test: (key: K, value: V, map ? : Map < K, V > ) => boolean) {
            if (map.size === 0)
                return false;

            for (var key in map.keys) {
                if (test(key, map.get(key), map))
                    return true;
            }

            return false;
        }

    export
    var none = function < K,
        V > (map: Map < K, V > , test: (key: K, value: V, map ? : Map < K, V > ) => boolean) {
            if (map.size === 0)
                return false;

            for (var key in map.keys) {
                if (test(key, map.get(key), map))
                    return false;
            }

            return true;
        }

    // insertion order will match sort order
    export
    var sort = function < K,
        V > (map: Map < K, V > , lessThan(a: V, b: V) => boolean): Map < K, V > {
            var sorted = new Map < K,
                V > ();
            var keys = map.keys;

            for (var i = 1; i < keys.length; ++i) {
                var minValue = map.get(keys[i]);
                var minKey = i;

                for (var j = i + 1; j < keys.length; ++j) {
                    var value = map.get(keys[j]);
                    if (lessThan(value, minValue)) {
                        minValue = value;
                        minKey = j;
                    }
                }

                sorted.set(minKey, minValue);
            }

            return sorted;
        }
}
