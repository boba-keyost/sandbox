/**
 * Реализуйте функцию, которая создаёт объект счётчика
 * с базовыми методами: increment, decrement, reset.
 *
 * @param {number} init - начальное значение счётчика
 * @returns {object} объект с методами increment, decrement, reset
 */
export function createCounter(init) {
    let num = init === undefined ? 0 : init;
    return {
        reset() {
            num = init
            return num
        },

        increment() {
            num++;
            return num
        },

        decrement() {
            num--;
            return num
        },
    }
}

const cntr = createCounter(-100)

console.log(cntr.decrement())
console.log(cntr.decrement())
console.log(cntr.reset())
console.log(cntr.increment())
console.log(cntr.increment())