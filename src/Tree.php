<?php

namespace GoProtect;

use Countable;
use Iterator;

class Tree implements Iterator, Countable
{
    protected int $itemCount = 0;
    protected int $tradesCount = 0;

    protected array $trades = [];

    /**
     * @throws Error
     */
    public function init(int $itemCount, int $tradesCount): void
    {
        if ($itemCount <= 0) {
            throw new Error(sprintf("item count(%d) should be greater than 0", $itemCount));
        }
        if ($tradesCount <= 0) {
            throw new Error(sprintf("item trades(%d) should be greater than 0", $tradesCount));
        }
        $this->itemCount = $itemCount;
        $this->tradesCount = $tradesCount;
    }

    public function initialized(): bool
    {
        return $this->itemCount > 0 && $this->tradesCount > 0;
    }

    public function filled(): bool
    {
        return $this->initialized()
            && count($this->trades) >= $this->tradesCount;
    }

    /**
     * @throws Error
     */
    public function checkImbalance(): ?ImbalanceTree
    {
        if (!$this->filled()) {
            throw new Error("tree not filled");
        }

        $imbalance = null;

        return $imbalance;
    }

    /**
     * @throws Error
     */
    public function add(int $a, int $b, int $cost): void
    {
        $this->trades[] = new Node($a, $b, $cost);
    }

    protected int $i = 0;

    public function current(): Node
    {
        return $this->trades[$this->i];
    }

    public function next(): void
    {
        $this->i++;
    }

    public function key(): int
    {
        return $this->i;
    }

    public function valid(): bool
    {
        return $this->i < $this->tradesCount;
    }

    public function rewind(): void
    {
        $this->i = 0;
    }

    public function count(): int
    {
        return $this->tradesCount;
    }
}