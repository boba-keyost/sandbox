/**
 * @param from string
 * @param to string
 * @param fetchFlights
 * @return {Promise<[]>}
 */
export async function findPath(from, to, fetchFlights) {
    const queue = [from]
    const parents = new Map([[from, null]])

    let qi = 0;
    while (qi < queue.length) {
        const cur = queue[qi]
        const flights = await fetchFlights(cur);
        if (flights !== undefined && flights.length) {
            if (flights.indexOf(to) >= 0) {
                const res = [to];
                let p = cur;
                while (p !== null && p !== undefined) {
                    res.unshift(p)
                    p = parents.get(p)
                }
                return res
            }
            for (let f of flights) {
                if (!parents.has(f)) {
                    parents.set(f, cur)
                    queue.push(f)
                }
            }
        }
        qi++;
    }

    return [];
}