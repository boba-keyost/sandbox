/**
 * Реализуйте функцию, которая принимает на вход два объекта Promise
 * с типом `number` и возвращает Promise с их суммой
 */
export const addTwoPromises = async function (...promises) {
   return Promise.allSettled(promises)
        .then((res) => {
            return res.reduce(
                (sum, result) => {
                    let val = result.value
                    if (result.status === "rejected") {
                        if (isNaN(result.reason)) {
                            throw result.reason
                        }
                        val = result.reason
                    }
                    return sum + val
                },
                0,
            )
        })
};

console.log(await addTwoPromises(Promise.resolve(2), Promise.resolve(2)))
console.log(await addTwoPromises(Promise.reject(3), Promise.resolve(2)))