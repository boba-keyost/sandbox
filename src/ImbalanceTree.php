<?php

namespace GoProtect;

class ImbalanceTree
{
    protected array $path = [];

    public function __toString(): string
    {
        return implode(" ", $this->path);
    }
}
