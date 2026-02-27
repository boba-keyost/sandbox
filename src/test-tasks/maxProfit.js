/**
 * @param {number[]} prices
 * @return {number}
 */
export function maxProfit(prices){
    let profit = 0;
    let minPrice = prices[0]
    for (let i = 1; i < prices.length; i++) {
        minPrice = Math.min(minPrice, prices[i])
        if (prices[i] > minPrice) {
            profit += prices[i] - minPrice
            minPrice = prices[i]
        }
    }
    return profit
}