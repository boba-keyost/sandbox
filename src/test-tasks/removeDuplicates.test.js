
import {describe, expect, test} from '@jest/globals';

import {removeDuplicates} from "src/removeDuplicates.js";

describe("test removeDuplicates", () => {
    const cases = [
        {
            name: "default",
            nums: [1,1,2],
            expected: [1, 2]
        },
        {
            name: "long",
            nums: [0,0,1,1,1,2,2,3,3,4],
            expected: [0,1,2,3,4]
        },
        {
            name: "all unique",
            nums: [1,2,3,4,5,6],
            expected: [1,2,3,4,5,6]
        },
        {
            name: "all samee",
            nums: [1,1,1,1,1],
            expected: [1]
        },
    ];
    test.each(cases)('$name', ({nums, expected}) => {
        const k = removeDuplicates(nums)
        expect(k).toEqual(expected.length)
        for (let i = 0; i < nums.length; i++) {
            expect(nums[i]).toEqual(expected[i])
        }
    })
})