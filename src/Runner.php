<?php

namespace GoProtect;

class Runner
{
    protected $inStream;
    protected $outStream;
    protected $errStream;

    public function __construct(mixed $inStream = null, mixed $outStream = null, mixed $errStream = null)
    {
        if (!is_resource($inStream)) {
            $inStream = fopen("php://stdin", "r");
        }
        if (!is_resource($outStream)) {
            $outStream = fopen("php://stdout", "w");
        }
        if (!is_resource($errStream)) {
            $errStream = fopen("php://stderr", "w");
        }
        $this->inStream = $inStream;
        $this->outStream = $outStream;
        $this->errStream = $errStream;
    }

    public function __destruct()
    {
        $this->closeAll();
    }

    public function run(): int
    {
        $tree = new Tree();

        $itemCount = 0;
        $tradesCount = 0;
        $i = 0;
        while (!$tree->filled() && $i <= $tradesCount) {
            $initialized = $tree->initialized();
            $a = 0;
            $b = 0;
            $cost = 0;
            $row = $this->read();
            if ($row === false) {
                break;
            }
            $row = trim($row);

            $errPrefix = sprintf("Invalid row #%d '%s'", $i + 1, $row);

            $res = !$initialized
                ? sscanf($row, "%d %d", $itemCount, $tradesCount)
                : sscanf($row, "%d %d %d", $a, $b, $cost);

            $expectedNums = !$initialized ? 2 : 3;

            if ($res < $expectedNums) {
                $this->prefixError($errPrefix, $res ? "too few items" : "invalid format");
                return 1;
            }

            try {
                if (!$initialized) {
                    $tree->init($itemCount, $tradesCount);
                } else {
                    $tree->add($a, $b, $cost);
                }
            } catch (Error $e) {
                $this->prefixError($errPrefix, $e->getMessage());
                return 1;
            }
            $i++;
        }
        $this->close($this->inStream);

        try {
            $imbalance = $tree->checkImbalance();
        } catch (Error $e) {
            $this->error($e->getMessage());
            return 1;
        }

        if ($imbalance !== null) {
            $this->out(sprintf("YES\n%s\n", $imbalance));
        } else {
            $this->out("NO\n");
        }

        return 0;
    }

    public function read(?int $length = null): string|false
    {
        return is_resource($this->inStream)
            ? fgets($this->inStream, $length)
            : false;
    }

    public function write($stream, string $out, ?int $length = null): void
    {
        if (is_resource($stream)) {
            fputs($stream, $out, $length);
        }
    }

    public function out(string $out, ?int $length = null): void
    {
        $this->write($this->outStream, $out, $length);
    }

    public function prefixError(string $prefix, string $error, ?int $length = null): void
    {
        if (!is_null($length)) {
            $length += strlen($prefix) + 2;
        }
        $this->error(sprintf("%s: %s", $prefix, $error), $length);
    }

    public function error(string $error, ?int $length = null): void
    {
        $this->write($this->errStream, $error, $length);
    }

    public function closeAll(): void
    {
        $this->close($this->inStream);
        $this->close($this->outStream);
        $this->close($this->errStream);
    }

    public function close($stream): void
    {
        if (is_resource($stream)) {
            fclose($stream);
        }
    }
}