export function removeDuplicates(nums){
    let dups = 0;
    let lastUnique = nums[0];
    for (let i = 1; i < nums.length; i++) {
        const num = nums[i]
        nums[i] = undefined
        if (num === lastUnique) {
            dups++;
        } else {
            nums[i - dups] = num
            lastUnique = num
        }
    }
    return nums.length - dups;
}