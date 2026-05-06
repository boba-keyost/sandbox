<?php

namespace GoProtect;

class ImbalanceTree
{
    protected array $path = [];

    public static function fromParentIds(int $id, array $parentIds): static
    {
        $path = [$id];
        $p = $parentIds[$id] ?? null;
        while ($p && $p !== $id) {
            $path[] = $p;
            $p = $parentIds[$p] ?? null;
        }

        return new static(array_reverse($path));
    }

    public function __construct(array $path)
    {
        $this->path = $path;
    }

    public function __toString(): string
    {
        return implode(" ", $this->path);
    }
}
