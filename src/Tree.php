<?php

namespace GoProtect;

use Countable;
use Iterator;

class Tree implements Iterator, Countable
{
    protected int $itemCount = 0;
    protected int $tradesCount = 0;

    protected array $nodes = [];
    protected array $trades = [];

    /**
     * @throws Error
     */
    public function init(int $itemCount, int $tradesCount): void
    {
        if ($itemCount <= 0) {
            throw Error::entityGreaterThan("item count", $itemCount);
        }
        if ($tradesCount <= 0) {
            throw Error::entityGreaterThan("trades count", $tradesCount);
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
    public function checkImbalance(bool $breakOnFirst = false): array
    {
        if (!$this->filled()) {
            throw Error::emptyTree();
        }

        $imbalancedNodes = [];


        for ($id = 1; $id <= $this->itemCount; $id++) {
            $imbalance = $this->checkNodeImbalance($id);
            if ($imbalance) {
                $imbalancedNodes[$id] = $imbalance;
                if ($breakOnFirst) {
                    break;
                }
            }
        }

        return $imbalancedNodes;
    }

    /**
     * @throws Error
     */
    public function checkNodeImbalance(int|Node $rootNode): ?ImbalanceTree
    {
        if (is_int($rootNode)) {
            $rootNode = $this->node($rootNode);
        }
        $queue = [$rootNode->getId()];
        $k = 0;
        $curLevel = 1;
        $levelPath = [];
        $levelCost = [];
        while ($k < count($queue)) {
            $cnt = count($queue);
            for ($i = $k; $i < $cnt; $i++) {
                $currentId = $queue[$i];
                foreach ($this->node($currentId)->getCosts() as $childId => $cost) {
                    if (!isset($levelPath[$curLevel][$childId])) {
                        $levelPath[$curLevel][$childId] = $levelPath[$curLevel - 1][$currentId] ?? [];
                    }
                    $levelPath[$curLevel][$childId][] = $childId;

                    $levelCost[$curLevel][$childId] = $cost + ($levelCost[$curLevel - 1][$currentId] ?? 0);
                    if (in_array($childId, $queue)) {
                        if ($childId === $rootNode->getId()) {
                            if ($levelCost[$curLevel][$childId] < 0) {
                                $path = $levelPath[$curLevel][$childId];
                                array_unshift($path, $childId);
                                return new ImbalanceTree($path);
                            }
                        }
                    } else {
                        $queue[] = $childId;
                    }
                }
            }
            $k = $i;
            $curLevel++;
        }

        return null;
    }

    /**
     * @throws Error
     */
    public function node(int $id): Node
    {
        if ($id > $this->itemCount) {
            throw Error::nodeIdLessThan($id, $this->itemCount, true);
        }
        if (!isset($this->nodes[$id])) {
            $this->nodes[$id] = new Node($id);
        }
        return $this->nodes[$id];
    }

    /**
     * @throws Error
     */
    public function addTrade(int $a, int $b, int $cost, bool $addReverse = false): void
    {
        $aNode = $this->node($a);
        $bNode = $this->node($b);

        $this->trades[] = "$a - $b $cost";

        $aNode->setCost($bNode, $cost);
        if ($addReverse) {
            $bNode->setCost($aNode, -$cost);
        }
        // todo: add cycle check here
    }

    protected int $i = 0;

    public function current(): Node
    {
        return $this->nodes[$this->i];
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