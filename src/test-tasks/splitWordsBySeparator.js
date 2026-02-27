export const splitWordsBySeparator = (words, separator) => {
    const sepLength = separator.length;
    return words.reduce(
        (result, input) => {
            let wordIndex = result.length;
            let sepIndex = 0;
            for (let i = 0; i < input.length; i++) {
                const ch = input.charAt(i);
                const isLast = input.length - 1 === i
                if (ch === separator.charAt(sepIndex)) {
                    sepIndex++;
                    if (sepIndex === sepLength) {
                        sepIndex = 0;
                        if (result[wordIndex] !== undefined) {
                            wordIndex++;
                        }
                        continue
                    }
                    if (isLast) {
                        sepIndex--;
                    }
                    if (!isLast) {
                        continue
                    }
                }
                if (result[wordIndex] === undefined) {
                    result[wordIndex] = "";
                }
                if (sepIndex > 0) {
                    for (let j = 0; j < sepIndex; j++) {
                        result[wordIndex] += separator.charAt(j);
                    }
                }
                result[wordIndex] += input.charAt(i);

                sepIndex = 0;
            }

            return result
        },
        []
    );
};
[
    [["", "one.two......three","four.five","six"], "."],
    [["1/", "/2", "/"], "/"],
    [["t....f", "hh...g"], "..."],
    [["tr..iu.", ".ef", "t....f", "hh...g"], ".."],
    [["triu<<", ">>ef"], "<<>>"],
].forEach(([words, separator]) => {
    const res = splitWordsBySeparator(words, separator)
    console.log(res)
})
