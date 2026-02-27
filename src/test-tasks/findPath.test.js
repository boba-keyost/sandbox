import {describe, expect, test} from '@jest/globals';

import {findPath} from 'src/findPath.js';

describe("test findPath", () => {
    const cases = [
        {
            name: "a -> n",
            "searchValue": "A",
            "replacer": "N",
            "flights": {
                "A": [
                    "B",
                    "D"
                ],
                "B": [
                    "C",
                    "N",
                    "Z"
                ],
                "D": [
                    "E",
                    "F"
                ],
                "F": [
                    "S"
                ]
            },
            expected: ["A","B","N"]
        },
        {
            name: "a -> s",
            "searchValue": "A",
            "replacer": "S",
            "flights": {
                "A": [
                    "B",
                    "D"
                ],
                "B": [
                    "C",
                    "N",
                    "Z"
                ],
                "D": [
                    "E",
                    "F"
                ],
                "F": [
                    "J",
                    "S"
                ]
            },
            expected: ["A","D","F","S"]
        },
        {
            name: "a -> zc",
            "searchValue": "A",
            "replacer": "zc",
            "flights": {
                "A": [
                    "B",
                    "D"
                ],
                "B": [
                    "C",
                    "N",
                    "Z"
                ],
                "C": [
                    "E",
                    "A"
                ],
                "D": [
                    "E",
                    "F"
                ],
                "F": [
                    "S",
                    "J",
                ],
                "J": [
                    "zc"
                ],
                "S": [
                    "N",
                    "C",
                    "gh",
                ],
                "gh": [
                    "zc"
                ],
            },
            expected: ["A","D","F","J", "zc"]
        },
        {
            name: "B -> S",
            "searchValue": "B",
            "replacer": "S",
            "flights": {
                "A": [
                    "B",
                    "D"
                ],
                "B": [
                    "C",
                    "N",
                    "Z"
                ],
                "D": [
                    "E",
                    "F"
                ],
                "F": [
                    "S"
                ]
            },
            expected: [],
        },
    ];
    test.each(cases.map(c => [c.name, c]))('%s', async(name, {from, to, flights, expected}) => {
        expect(await findPath(
            from,
            to,
            (from) => Promise.resolve(flights[from])
        )).toEqual(expected)
    })
})