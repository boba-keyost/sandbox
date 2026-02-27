
const cacheSymbol = Symbol("cache")
/**
 *
 * @param fn function
 * @returns {(function(...[*]): (any|undefined))|*}
 */
export function memoize(fn) {
    if (typeof fn !== "function") {
        throw("fn isn't a function")
    }
    if (memoize[cacheSymbol] === undefined) {
        memoize[cacheSymbol] = new Map;
    }
    return function(...args) {
        const fnArgs = fn.length ? new Array(!fn.length).fill(undefined) : args;
        for (let i = 0; i < fn.length; i++) {
            if (i >= args.length) {
                break;
            }
            fnArgs[i] = args[i]
        }
        const key = `${fn.name}-${JSON.stringify(fnArgs)}`
        if (memoize[cacheSymbol].has(key)) {
            return memoize[cacheSymbol].get(key)
        }
        const res = fn(...fnArgs)
        memoize[cacheSymbol].set(key, res)
        return res;
    }
}

export function fn(a, b) {
    return a + b;
}

export const callingArguments = [
    [1,2],
    [1,2],
    [1,2,3],
];
const memoizedFn = memoize(fn);
memoizedFn(1, 2)
memoizedFn(1, 2)
callingArguments.forEach(args => {
    const ret = memoizedFn(...args)
    console.log(ret)
})