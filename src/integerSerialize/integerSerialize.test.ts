import {describe, expect, test} from '@jest/globals';

import {integerSerialize, integerUnserialize} from "./integerSerialize";

interface testCase{
    name: string,
    nums: number[],
    expected?: string,
    expectedError?: unknown,
}

describe("test integerSerialize", () => {
    const cases: testCase[] = [];

    const createRandomNums = (min: number, max: number, count: number): number[] => {
        const nums = new Array(count)
        for (let i = 0; i < count; i++) {
            nums[i] = Math.round(min + Math.random() * max - min)
        }
        return nums
    }

    for (let count of [50, 100, 500, 1000]) {
        cases.push({
            name: "Random " + count + " numbers",
            nums: createRandomNums(1, 300, count),
        })
    }
    for (let [min, max] of [[1,9], [10,99], [100,300]]) {
        cases.push({
            name: `Random numbers between ${min} and ${max}`,
            nums: createRandomNums(min, max, 50),
        })
    }
    const nums = Array(900)
    for (let i = 1; i <= 300; i++) {
        nums[3 * i] = nums[3 * i + 1] = nums[3 * i + 2] = i
    }
    nums.sort(() => Math.random() - 0.5)
    cases.push({
        name: "All nums between 1 and 300 repeated 3 times in random order",
        nums,
    })

    test.each(cases)('$name', ({nums, expected, expectedError}) => {
        try {
            const serialized = integerSerialize(nums)
            expect(serialized.length).toBeLessThanOrEqual(String(nums).length / 2)
            if (expected !== undefined) {
                expect(serialized).toEqual(expected)
            }
            expect(integerUnserialize(serialized)).toEqual(nums)
        } catch (e) {
            if (expectedError !== undefined) {
                expect(e).toEqual(e)
            } else {
                throw e
            }
        }
    })
})