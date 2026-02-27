
import {describe, expect, test} from '@jest/globals';

import {maxProfit} from "src/maxProfit.js";

describe("test maxProfit", () => {
    const cases = [
        {
            name: "first",
            prices: [7,1,5,3,6,4],
            expected: 7
        },
        {
            name: "increase",
            prices: [1,2,3,4,5],
            expected: 4
        },
        {
            name: "no-profit",
            prices: [7,6,4,3,1],
            expected: 0
        },
    ];
    test.each(cases)('$name', ({prices, expected}) => {
        const profit = maxProfit(prices)
        expect(profit).toEqual(expected)
    })
})