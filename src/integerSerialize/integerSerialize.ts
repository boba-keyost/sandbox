/**
 * Есть множество (массив, где порядок не важен) целых чисел в диапазоне от 1 до 300. Количество чисел - от 5 до 1000. Простейший алгоритм сериализует множество в строку вида "1,300,237,188". Напишите функцию сериализации / десериализации в строку, чтобы итоговая строка была компактной (итоговая строка должна быть в 2 раза короче простейшей сериализации для любых возможных наборов чисел).
 * Цель задачи - максимально сжать данные относительно простой сериализации без алгоритма сжатия.
 * Сериализованная строка должна содержать только ASCII символы. Можно использовать любой язык программирования.
 * Вместе с решением нужно прислать набор тестов  - исходная строка, сжатая строка, коэффициент сжатия.
 * Примеры тестов: простейшие короткие, случайные - 50 чисел, 100 чисел, 500 чисел, 1000 чисел, граничные - все числа 1 знака, все числа из 2-х знаков, все числа из 3-х знаков, каждого числа по 3 - всего чисел 900.
 */

export const SERIALIZER_SAME_DIGITS = Symbol("serializer-same-digits");
export const SERIALIZER_DELTA = Symbol("serializer-delta");
export const SERIALIZER_DELTA_OF_DELTA = Symbol("serializer-delta-of-delta");
export const SERIALIZER_DELTA_KEY = Symbol("serializer-delta-key");
export const SERIALIZER_DEFAULT = Symbol("serializer-default");

export type SERIALIZERS_AVAILABLE = keyof typeof serializers

export function integerSerialize(
    nums: number[],
    useSerializers: SERIALIZERS_AVAILABLE[] = [],
    skipSerializers: SERIALIZERS_AVAILABLE[] = [],
): string{
    const defaultSerialized = String(nums)
    const desiredCompression = 0.5
    const desiredLength = Math.round(defaultSerialized.length * desiredCompression)

    let desiredFound: boolean = false;
    let minSerialized = defaultSerialized

    if (useSerializers.length === 0) {
        useSerializers = [
            SERIALIZER_SAME_DIGITS,
            SERIALIZER_DELTA,
            SERIALIZER_DELTA_OF_DELTA,
            SERIALIZER_DELTA_KEY,
            SERIALIZER_DEFAULT,
        ]
    }
    for (let serializerName of useSerializers) {
        if (skipSerializers.indexOf(serializerName) >= 0) {
            continue
        }
        const serializer: Serializer = serializers[serializerName]
        if (serializer === undefined) {
            continue
        }
        let serialized: string | null = serializer(nums)
        if (serialized === null) {
            continue
        }
        desiredFound = serialized.length <= desiredLength
        if (minSerialized.length >= serialized.length) {
            minSerialized = serialized
        }
        if (desiredFound) {
            break;
        }
    }

    return minSerialized
}

export function integerDeserializeChunk(serialized: string): number[]{
    const {deserializer, parts} = detectDeserializer(serialized)
    if (deserializer === null) {
        return []
    }
    return parts.reduce<number[]>(
        (nums: number[], part: string) => {
            let deserialized = deserializer(part)
            if (deserialized !== null) {
                nums.push(...deserialized)
            }
            return nums
        },
        [],
    )
}

export function integerDeserialize(serialized: string): number[]{
    return serialized.split(CHAR_SEPARATOR_CHUNK).reduce<number[]>(
        (nums, chunk): number[] => {
            nums.push(...integerDeserializeChunk(chunk))
            return nums
        },
        []
    )
}

const charTable: string[] = []

const CHAR_SEPARATOR_CHUNK = ";"
const CHAR_SEPARATOR_PART = ","
const CHAR_PREFIX_DECIMAL = "."
const CHAR_DELTA_PLUS = "+"
const CHAR_DELTA_MINUS = "-"
const CHAR_DELTA_EQ = "_"
const CHAR_PREFIX_DELTA = "^"
const CHAR_PREFIX_SEPARATOR = ":"
const CHAR_MULTI = "*"
const CHAR_MULTI_WRAP_LEFT = "("
const CHAR_MULTI_WRAP_RIGHT = ")"

function getCharTable(): string[] {
    if (charTable.length === 0) {
        const reservedChars = [
            127,
            160,
            173,
            128,
            129,
            130,
            131,
            132,
            133,
            134,
            135,
            136,
            137,
            138,
            139,
            140,
            141,
            142,
            143,
            144,
            145,
            146,
            147,
            148,
            149,
            150,
            151,
            152,
            153,
            154,
            155,
            156,
            157,
            158,
            159,
        ]
        for (let i = 0; i < 10; i++) {
            const ch = String(i)
            charTable.push(ch)
            reservedChars.push(ch.charCodeAt(0))
        }
        for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
            const ch = String.fromCharCode(i)
            charTable.push(ch)
            reservedChars.push(i)
        }
        for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
            const ch = String.fromCharCode(i)
            charTable.push(ch)
            reservedChars.push(i)
        }
        for (let ch of [
            " ",
            "\\",
            CHAR_SEPARATOR_CHUNK,
            CHAR_SEPARATOR_PART,
            CHAR_PREFIX_DECIMAL,
            CHAR_DELTA_PLUS,
            CHAR_DELTA_MINUS,
            CHAR_DELTA_EQ,
            CHAR_PREFIX_DELTA,
            CHAR_PREFIX_SEPARATOR,
            CHAR_MULTI,
            CHAR_MULTI_WRAP_LEFT,
            CHAR_MULTI_WRAP_RIGHT,
        ]) {
            reservedChars.push(ch.charCodeAt(0))
        }
        const minChar = 33
        for (let i = minChar; i < 256; i++) {
            const ch = String.fromCharCode(i)
            if (ch.length == 1 && reservedChars.indexOf(i) === -1) {
                charTable.push(ch)
            }
        }
    }
    return charTable
}

function getSerializedDecimalsPattern(useCharTable: boolean = true): string {
    return useCharTable
        ? "[" + getCharTable().join("").replaceAll(/[\[\]{}]/g, "\\$&") + "]"
        : "\\d";
}

const convertCache: {
    decimal: {[key: number]: string},
    custom: {[key: string]: number}
} = {
    decimal: {},
    custom: {},
};

function convertDecimal(num: number): string {
    if (num > -10 && num < 10) {
        return String(num)
    }
    let p = "";
    if (num < 0) {
        p = CHAR_DELTA_MINUS
        num *= -1
    }
    if (convertCache.decimal[num] !== undefined) {
        return p + convertCache.decimal[num]
    }
    for (let s in convertCache.custom) {
        if (convertCache.custom[s] === num) {
            return p + s
        }
    }
    const charTable = getCharTable()
    const base = charTable.length
    let prevQuotient: number = num;
    convertCache.decimal[num] = ""
    while (prevQuotient > 0) {
        const quotient = Math.floor(prevQuotient / base)
        convertCache.decimal[num] = charTable[prevQuotient - quotient * base] + convertCache.decimal[num]
        prevQuotient = quotient
    }

    return p + convertCache.decimal[num];
}

function toDecimal(str: string): number {
    if (convertCache.custom[str] !== undefined) {
        return convertCache.custom[str]
    }
    for (let n in convertCache.decimal) {
        if (convertCache.decimal[n] === str) {
            return Number(n)
        }
    }
    const charTable = getCharTable()
    const base = charTable.length
    const chars = str.split("")
    convertCache.custom[str] = chars.reduce<number>(
        (num: number, ch: string, k: number) => {
            if (!isNaN(num)) {
                const ind = charTable.indexOf(ch)
                if (ind < 0) {
                    return NaN
                }
                num += ind * Math.pow(base, chars.length - k - 1)
            }
            return num
        },
        0
    )

    return convertCache.custom[str];
}

function findDelta(nums: number[], repeats: number = 1): number[] {
    const delta = new Array(nums.length)
    delta[0] = nums[0]
    for (let i = 1; i < nums.length; i++) {
        delta[i] = nums[i] - nums[i - 1]
    }

    return repeats > 1 ? findDelta(delta, repeats - 1) : delta;
}

function numToString(num: number | string, convert: boolean = true): string{
    return typeof num === "number" ? (convert ? convertDecimal(num) : String(num)) : num;
}

function join(
    elements: (string | number)[],
    separator: string = "",
    minSameCounter: number = 1,
    wrapSame: boolean | ((prev: string, multi: string) => string) = false,
    convert: boolean = true
): string {
    if (!minSameCounter) {
        return elements.map(v => typeof v === "number" ? numToString(v, convert) : v).join(separator)
    }
    let joined = ""
    let prevEl: string | undefined = undefined;
    let sameCounter: number = 0;
    for (let i = 0; i < elements.length; i++) {
        const isLast = i === elements.length - 1;
        const el = numToString(elements[i], convert)
        if (prevEl !== el || isLast) {
            if (sameCounter > 0 && prevEl !== undefined) {
                if (sameCounter + 1 >= minSameCounter) {
                    const multi = `${CHAR_MULTI}${numToString(sameCounter + 1, convert)}`
                    if (wrapSame) {
                        joined = joined.substring(0, joined.length - prevEl.length)
                            + (
                                typeof wrapSame === "function"
                                    ? wrapSame(prevEl, multi)
                                    : `${CHAR_MULTI_WRAP_LEFT}${prevEl}${multi}${CHAR_MULTI_WRAP_RIGHT}`
                            )
                    } else {
                        joined += multi
                    }
                } else {
                    const joinedSame = `${prevEl}${separator}`.repeat(sameCounter)
                    joined += separator !== "" ? joinedSame.substring(0, joinedSame.length - separator.length) : joinedSame
                }
                sameCounter = 0
            }
            if (i > 0 && separator !== "") {
                joined += separator
            }
            if (prevEl !== el) {
                joined += el
                prevEl = el
            }
        } else if (minSameCounter) {
            sameCounter++
        }
    }
    return joined;
}

function deltaToString(delta: number[], key?: number, convert: boolean = true): string[] {
    const stringDelta = delta.map<string>(
        (d: number, k: number)=> {
            if (key !== undefined) {
                d = d - key
            }
            let ds = numToString(d, convert)
            if (d > 0 && (k > 0 || key !== undefined)) {
                ds = `${CHAR_DELTA_PLUS}${ds}`
            } else if (d === 0) {
                ds = CHAR_DELTA_EQ
            }
            return ds
        }
    )
    if (key !== undefined) {
        stringDelta.unshift(`${numToString(key, convert)}${CHAR_PREFIX_SEPARATOR}`)
    }

    return stringDelta
}

type Serializer = (nums: number[]) => string | null;

type Deserializer = (serialized: string) => number[] | null;

function sameDigitSerialize(nums: number[], digits: number = 1): string | null {
    const satisfied = nums.every(v => v >= Math.pow(10, digits - 1) && v < Math.pow(10, digits))
    return satisfied
        ? (
            CHAR_PREFIX_DECIMAL.repeat(digits)
            + join(
                nums,
                "",
                Math.ceil(1 + 3 / digits),
                (prevVal, multi) => `${prevVal}${multi},`,
                false,
            )
        )
        : null
}

function deltaSerialize(nums: number[], repeats: number = 1, findKey: boolean = false): string | null {
    let key: number | undefined = undefined;
    if (findKey) {
        const cnt: {[key:number]: number} = {}
        for (let n of nums) {
            if (cnt[n] === undefined) {
                cnt[n] = 0
            }
            cnt[n]++
        }
        let maxCnt: number = 0
        for (let c in cnt) {
            if (key === undefined || cnt[c] > maxCnt) {
                maxCnt = cnt[c]
                key = Number(c)
            }
        }
        if (key === 0) {
            key = undefined
        }
        // if (key !== undefined && key < 10 && key > -10) {
        //     key = undefined
        // }
    }
    let delta: number[] = findDelta(nums, repeats);

    return CHAR_PREFIX_DELTA.repeat(repeats) + join(deltaToString(delta, key))
}

const serializers = {
    [SERIALIZER_SAME_DIGITS]: (nums: number[]): string | null => {
        for (let digits = 3; digits > 0; digits--) {
            const serialized = sameDigitSerialize(nums, digits)
            if (serialized !== null) {
                return serialized
            }
        }
        return null
    },
    [SERIALIZER_DELTA]: (nums: number[]): string | null => {
        return deltaSerialize(nums)
    },
    [SERIALIZER_DELTA_OF_DELTA]: (nums: number[]): string | null => {
        return deltaSerialize(nums, 2)
    },
    [SERIALIZER_DELTA_KEY]: (nums: number[]): string | null => {
        return deltaSerialize(nums, 1, true)
    },
    [SERIALIZER_DEFAULT]: (nums: number[]): string | null => {
        return join(nums, ",")
    },
};

function replaceMulti(str: string, digits: number = 0, separator: string = "", useCharTable: boolean = true): string {
    const chars = getSerializedDecimalsPattern(useCharTable);
    const reg = new RegExp(`\\(?([+-]?${chars}${digits > 0 ? `{${digits}}` : '+'}|_)\\*(${chars}+)\\)?`, 'g')
    return str.replaceAll(
        reg,
        (_, char, cnt) => {
            const joinedSame = `${char}${separator}`.repeat(Number(cnt))
            return joinedSame.substring(0, joinedSame.length - separator.length)
        }
    )
}

type DetectDeserializerRetParams = {deserializer: Deserializer | null, parts: string[]}

function detectDeserializer(serialized: string): DetectDeserializerRetParams {
    type DetectorMatch = RegExpMatchArray | boolean | null;
    type DetectorRetParams = {
        match: (serialized: string) => DetectorMatch,
        deserializer?: Deserializer,
        getDeserializer?: ((m: DetectorMatch) => Deserializer),
        prefix?: string,
        getPrefix?: ((m: DetectorMatch) => string),
        split?: boolean,
    }
    const detectors: DetectorRetParams[] = [
        {
            match: (serialized: string): DetectorMatch => {
                return serialized.match(new RegExp("^\\" + CHAR_PREFIX_DECIMAL + "+"))
            },
            getDeserializer: (m: DetectorMatch) => (serialized: string): number[] => {
                const nums: number[] = [];
                m = m as RegExpMatchArray
                const digits = m[0].length
                const fullString = replaceMulti(serialized, digits, "")
                for (let i = 0; i < fullString.length; i += digits) {
                    nums.push(Number(fullString.substring(i, i + digits)))
                }
                return nums
            },
            getPrefix: (m: DetectorMatch): string => {
                m = m as RegExpMatchArray
                return CHAR_PREFIX_DECIMAL.repeat(m && m.length > 0 ? m[0].length : 0)
            },
        },
        {
            match: (serialized: string): DetectorMatch => {
                const chars = getSerializedDecimalsPattern(true);
                return serialized.match(new RegExp("^(\\" + CHAR_PREFIX_DELTA + `+)(?:(${chars}+):)?`))
            },
            getDeserializer: (m: DetectorMatch) => (serialized: string): number[] => {
                const nums: number[] = [];
                m = m as RegExpMatchArray
                const runs = m[1].length
                const key = m[2] !== undefined ? toDecimal(m[2]) : 0;
                const fullString = replaceMulti(serialized, 0, "")
                let curVal: string = "";
                let j = 0;
                let negative: boolean = false;
                const nextNumChars = [CHAR_DELTA_PLUS, CHAR_DELTA_MINUS, CHAR_DELTA_EQ]
                for (let i = 0; i <= fullString.length; i++) {
                    const ch = fullString[i]
                    if (ch === undefined || nextNumChars.indexOf(ch) >= 0) {
                        if (i > 0) {
                            const curValNum = curVal !== "" ? toDecimal(curVal) * (negative ? -1 : 1) : 0
                            nums[j] = key + (j === 0 ? curValNum : nums[j - 1] + curValNum)
                            curVal = ""
                            j++
                        }
                        negative = ch === CHAR_DELTA_MINUS;
                        continue
                    }
                    curVal += ch
                }
                for (let r = 1; r < runs; r++) {
                    for (let i = 1; i < nums.length; i++) {
                        nums[i] = nums[i - 1] + nums[i]
                    }
                }
                return nums
            },
            getPrefix: (m: DetectorMatch): string => {
                m = m as RegExpMatchArray
                return CHAR_PREFIX_DELTA.repeat(m && m.length > 0 ? m[0].length : 0)
            },
        },
        { // default
            match: (_: string): DetectorMatch => {
                return true;//serialized.match(new RegExp(`^(\d+(${CHAR_MULTI}\d+)?${CHAR_SEPARATOR_PART}?)+$`))
            },
            deserializer: (serialized: string): number[] => {
                return replaceMulti(serialized, 0, CHAR_SEPARATOR_PART).split(CHAR_SEPARATOR_PART).map(v => toDecimal(v))
            },
            prefix: "",
            split: false,
        },
    ];

    let deserializer: Deserializer | null = null
    let prefix = ""
    let split: boolean = true
    for (let detector of detectors) {
        const match = detector.match(serialized)
        if (match) {
            if (detector.getDeserializer) {
                deserializer = detector.getDeserializer(match)
            } else if (detector.deserializer) {
                deserializer = detector.deserializer
            }
            if (detector.getPrefix) {
                prefix = detector.getPrefix(match)
            } else if (detector.prefix) {
                prefix = detector.prefix
            }
            if (detector.split !== undefined) {
                split = detector.split
            }
            break;
        }
    }
    return {
        deserializer,
        parts: split ? serialized.substring(prefix.length).split(CHAR_SEPARATOR_PART) : [serialized.substring(prefix.length)]
    }
}