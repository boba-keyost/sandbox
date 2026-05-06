<?php

namespace GoProtect;

class Node
{
    protected int $a;
    protected int $b;
    protected int $cost;

    /**
     * @throws Error
     */
    public function __construct(int $a, int $b, int $cost)
    {
        if ($a <= 0) {
            throw new Error(sprintf("A(%d) should be greater than 0", $a));
        }
        if ($b <= 0) {
            throw new Error(sprintf("B(%d) should be greater than 0", $b));
        }

        $this->a = $a;
        $this->b = $b;
        $this->cost = $cost;
    }
}