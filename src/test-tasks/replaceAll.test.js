import {describe, expect, test} from '@jest/globals';

import {replaceAllPolyfill} from 'src/replaceAll.js';

describe("test replaceAll", () => {
    test.each([
        {
            name: "empty",
            string: 'Повар спрашивает повара: повар, какова твоя профессия?',
            searchValue: '',
            replacer: '.',
            expected: '.П.о.в.а.р. .с.п.р.а.ш.и.в.а.е.т. .п.о.в.а.р.а.:. .п.о.в.а.р.,. .к.а.к.о.в.а. .т.в.о.я. .п.р.о.ф.е.с.с.и.я.?.'
        },
        {
            name: "simple",
            string: 'Повар спрашивает повара: повар, какова твоя профессия? повар',
            searchValue: 'повар',
            replacer: 'программист',
            expected: 'Повар спрашивает программиста: программист, какова твоя профессия? программист'
        },
        {
            name: "simple object",
            string: new String('Повар спрашивает повара: повар, какова твоя профессия?'),
            searchValue: new String('повар'),
            replacer: new String('программист'),
            expected: 'Повар спрашивает программиста: программист, какова твоя профессия?'
        },
        {
            name: "not found",
            string: 'Повар спрашивает повара: повар, какова твоя профессия?',
            searchValue: 'токарь',
            replacer: 'программист',
            expected: 'Повар спрашивает повара: повар, какова твоя профессия?'
        },
        {
            name: "repeat",
            string: 'Ехал повар через повар, видит повар - повар повар',
            searchValue: 'повар',
            replacer: 'программист',
            expected: 'Ехал программист через программист, видит программист - программист программист'
        },
        {
            name: "regexp",
            string: 'Повар спрашивает повара: «Повар, какова твоя профессия?»',
            searchValue: /(п)овар/gi,
            replacer: '$1рограммист',
            expected: 'Программист спрашивает программиста: «Программист, какова твоя профессия?»',
        },
        {
            name: "matcher",
            string: '<b>Экранирование</b> предотвращает XSS-атаки на сайтах',
            searchValue: /([<>&'"])/g,
            replacer: (match) => `&#${match.charCodeAt(0)};`,
            expected: '&#60;b&#62;Экранирование&#60;/b&#62; предотвращает XSS-атаки на сайтах',
        },
        {
            name: "regexp error",
            string: 'Смотря какой fabric, смотря сколько details',
            searchValue: /(как)ой fabric/,
            replacer: '$1ая ткань',
            expectedError: new TypeError('String.prototype.replaceAll called with a non-global RegExp argument'),
        },
        {
            name: "simple non-string",
            string: 'Повар спрашивает 123а: 123, какова твоя профессия?',
            searchValue: 123,
            replacer: 'программист',
            expected: 'Повар спрашивает программиста: программист, какова твоя профессия?'
        },
        {
            name: "simple non-string",
            string: 'Повар спрашивает 123а: 123, какова твоя профессия?',
            searchValue: 123,
            replacer: 'программист',
            expected: 'Повар спрашивает программиста: программист, какова твоя профессия?'
        },
        {
            name: "symbol",
            string: 'Смотря какой fabric, смотря сколько details',
            searchValue: Symbol("fabric"),
            replacer: 'ткань',
            expectedError: new TypeError('Cannot convert a Symbol value to a string'),
        },
        {
            name: "null",
            string: 'Смотря какой null, смотря сколько null',
            searchValue: null,
            replacer: 'ткань',
            expected: 'Смотря какой ткань, смотря сколько ткань',
        },
    ])('$name', ({string, searchValue, replacer, expected, expectedError}) => {
        const defaultReplaceAll = String.prototype.replaceAll;
        String.prototype.replaceAll = replaceAllPolyfill;
        let actual
        let actualError
        try {
            actual = string.replaceAll(searchValue, replacer)
        } catch (e) {
            actualError = e
        }
        String.prototype.replaceAll = defaultReplaceAll;
        expect(actualError).toEqual(expectedError)
        if (expected !== undefined) {
            expect(actual).toEqual(expected)
            expect(actual).toEqual(string.replaceAll(searchValue, replacer))
        }
    })
})