<?php

namespace GoProtect;

use Exception;
use Throwable;

class Error extends Exception implements Throwable
{
    public static function nodeIdGreaterThan(int $nodeId, int $expected = 0, bool $inclusive = false): static
    {
        return static::entityGreaterThan("Id", $nodeId, $expected, $inclusive);
    }

    public static function nodeIdLessThan(int $nodeId, int $expected = 0, bool $inclusive = false): static
    {
        return static::entityLessThan("Id", $nodeId, $expected, $inclusive);
    }

    public static function entityGreaterThan(
        string $entity,
        int $nodeId,
        int $expected = 0,
        bool $inclusive = false
    ): static {
        return static::entityCompareThan($entity, $nodeId, "greater", $expected, $inclusive);
    }

    public static function entityLessThan(
        string $entity,
        int $nodeId,
        int $expected = 0,
        bool $inclusive = false
    ): static {
        return static::entityCompareThan($entity, $nodeId, "less", $expected, $inclusive);
    }

    public static function entityCompareThan(
        string $entity,
        int $id,
        string $compare = "greater",
        int $expected = 0,
        bool $inclusive = false
    ): static {
        return new static(
            sprintf(
                "%s(%d) should be %s than %s%d",
                $entity,
                $id,
                $compare,
                $inclusive ? "or equals " : '',
                $expected
            )
        );
    }

    public static function emptyTree(): static
    {
        return new Error("tree not filled");
    }
}