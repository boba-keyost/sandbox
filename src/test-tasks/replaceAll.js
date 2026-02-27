export function replaceAllPolyfill(searchValue, replacer) {
    if (typeof searchValue === "object" && searchValue !== null) {
        if (searchValue instanceof RegExp) {
            if (!searchValue.global) {
                throw new TypeError('String.prototype.replaceAll called with a non-global RegExp argument')
            }
            return this.replace(searchValue, replacer)
        }
        if (typeof searchValue[Symbol.replace] === "function") {
            return searchValue[Symbol.replace](this, searchValue)
        }
        if (searchValue instanceof Symbol) {
            throw new TypeError("Cannot convert a Symbol value to a string")
        }
    }
    searchValue = "" + searchValue
    let ret = ""
    let found = searchValue.length > 0 ? -searchValue.length : -1;
    let prevFound = 0;
    while ((found = this.indexOf(searchValue, prevFound === found ? prevFound + 1 : prevFound)) >= 0 && found <= this.length) {
        if (found > prevFound) {
            ret += this.slice(prevFound, found)
        }
        ret += (typeof replacer === "function" ? replacer(searchValue, found) : replacer);
        prevFound = found + searchValue.length
        if (found >= this.length) {
            break
        }
    }
    if (prevFound <= this.length - 1) {
        ret += this.slice(prevFound, this.length)
    }
    return ret
}

if (typeof String.prototype.replaceAll === "undefined") {
    String.prototype.replaceAll = replaceAllPolyfill
}