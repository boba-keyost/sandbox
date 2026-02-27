import {describe, expect, test} from '@jest/globals';

import {
    integerDeserialize,
    integerSerialize, SERIALIZER_DEFAULT,
    SERIALIZER_DELTA,
    SERIALIZER_DELTA_KEY,
    SERIALIZER_DELTA_OF_DELTA,
    SERIALIZER_SAME_DIGITS,
    type SERIALIZERS_AVAILABLE
} from "./integerSerialize.ts";

interface testCase{
    name: string,
    nums: number[],
    useSerializers?: SERIALIZERS_AVAILABLE[]
    skipSerializers?: SERIALIZERS_AVAILABLE[]
    expectedRatio?: number,
    expected?: string,
    expectedError?: unknown,
}

describe("test integerSerialize", () => {
    const cases: testCase[] = [];
    cases.push(
        {
            name: "Manual 1 digit only",
            nums: [2,1,1,2,6,7,2,2,2,2,2,7,7,9,2],
            expected: ".2112672*5,7792"
        },
        {
            name: "Manual 1 digit only (use delta)",
            nums: [2,1,1,2,6,7,2,2,2,2,2,7,7,9,2],
            expected: "^2-1_+1+4+1-5_*4+5_+2-7",
            useSerializers: [SERIALIZER_DELTA],
        },
        {
            name: "Manual 1 digit only (use delta of delta)",
            nums: [2,1,1,2,6,7,2,2,2,2,2,7,7,9,2],
            expected: "^^2-3+1*2+3-3-6+5_*3+5-5+2-9",
            useSerializers: [SERIALIZER_DELTA_OF_DELTA],
        },
        {
            name: "Manual 1 digit only (use delta key)",
            nums: [3,1,1,2,6,7,2,2,2,2,2,7,7,9,2],
            expected: "^2:+1-4-2-1+2-1-7-2*4+3-2_-9",
            useSerializers: [SERIALIZER_DELTA_KEY],
        },
        {
            name: "Manual 2 digits only",
            nums: [24,15,19,27,65,77,26,26,26,26,76,78,98,26],
            expected: "O,F,J,R,$,`,Q*4,],{,²,Q",
        },
        {
            name: "Manual 2 digits only (use same-digit)",
            nums: [24,15,19,27,65,77,26,26,26,26,76,78,98,26],
            expected: "..24151927657726*4,76789826",
            useSerializers: [SERIALIZER_SAME_DIGITS],
        },
        {
            name: "Manual 3 digits only",
            nums: [249,157,190,279,651,771,266,762,783,981,267],
            expected: "^1?-«+X+¨+2K+È-2é+2à+L+1M-4A",
        },
        {
            name: "Manual 3 digits only (use same-digit)",
            nums: [249,157,190,279,651,771,266,762,783,981,267],
            expected: "...249157190279651771266762783981267",
            useSerializers: [SERIALIZER_SAME_DIGITS],
        },
        {
            name: "Manual 3 digits only (skip delta)",
            nums: [249,157,190,279,651,771,266,762,783,981,267],
            expected: "1?,í,1E,1·,3Ë,4&,1©,4w,4|,5µ,1ª",
            skipSerializers: [SERIALIZER_DELTA, SERIALIZER_DELTA_OF_DELTA, SERIALIZER_DELTA_KEY],
        },
        {
            name: "Manual 3 digits only (use default)",
            nums: [249,157,190,279,651,771,266,762,783,981,267],
            expected: "1?,í,1E,1·,3Ë,4&,1©,4w,4|,5µ,1ª",
            useSerializers: [SERIALIZER_DEFAULT],
        },
        {
            name: "Manual 3 digit only (use delta key)",
            nums: [249,157,190,279,651,771,266,762,783,981,267],
            expected: "^í:+«-1?-Ì-'+1d-b-3Ö+1ó-Ø+f-4÷",
            useSerializers: [SERIALIZER_DELTA_KEY],
        },
    )

    const createRandomNums = (min: number, max: number, count: number): number[] => {
        const nums = new Array(count)
        for (let i = 0; i < count; i++) {
            nums[i] = Math.round(min + Math.random() * (max - min))
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
    for (let i = 0; i < 300; i++) {
        nums[3 * i] = nums[3 * i + 1] = nums[3 * i + 2] = i+1
    }
    nums.sort(() => Math.random() - 0.5)
    cases.push({
        name: "All nums between 1 and 300 repeated 3 times in random order",
        nums,
    })

    test.each(cases)('$name', ({nums, useSerializers, skipSerializers, expected, expectedError, expectedRatio}) => {
        try {
            const serialized = integerSerialize(nums, useSerializers, skipSerializers)
            const simple = String(nums)
            if (expectedRatio === undefined) {
                expect(serialized.length).toBeLessThanOrEqual(simple.length)
                if (serialized.length > Math.round(simple.length * 0.5)) {
                    console.warn(`Serialization ratio is greater than expected 0.5. Got: '${(serialized.length / simple.length).toFixed(2)}'`)
                }
            } else {
                expect(serialized.length).toBeLessThanOrEqual(Math.round(simple.length * expectedRatio))
            }
            expect(integerDeserialize(serialized)).toEqual(nums)
            if (expected !== undefined) {
                expect(serialized).toEqual(expected)
            }
        } catch (e) {
            if (expectedError !== undefined) {
                expect(e).toEqual(e)
            } else {
                throw e
            }
        }
    })
})