<?php

namespace GoProtect;

class Node
{
    protected int $id;

    protected array $costs = [];

    /**
     * @throws Error
     */
    public function __construct(int $id, bool $root = false)
    {
        if (!$root && $id <= 0) {
            throw Error::nodeIdGreaterThan($id);
        }

        $this->id = $id;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setCost(self $child, int $cost): void
    {
        if (!isset($this->costs[$child->getId()])) {
            $this->costs[$child->getId()] = $cost;
        }
    }

    public function getCosts(): array
    {
        return $this->costs;
    }
}