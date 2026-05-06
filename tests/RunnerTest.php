<?php

namespace Tests;

use GoProtect;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

#[CoversClass(GoProtect\Runner::class)]
#[CoversClass(GoProtect\Tree::class)]
#[CoversClass(GoProtect\Node::class)]
class RunnerTest extends TestCase
{
    public static function testRunDataProvider(): array
    {
        return [
            "empty input" => [
                "input" => [],
                "errOutput" => ["tree not filled"],
                "expected" => 1,
            ],
            "no trades" => [
                "input" => [
                    "1 2"
                ],
                "errOutput" => ["tree not filled"],
                "expected" => 1,
            ],
            "invalid input: num count" => [
                "input" => [
                    "2"
                ],
                "errOutput" => ["Invalid row #1 '2': too few items"],
                "expected" => 1,
            ],
            "invalid input: value" => [
                "input" => [
                    "a 2"
                ],
                "errOutput" => ["Invalid row #1 'a 2': invalid format"],
                "expected" => 1,
            ],
            "invalid input: negative items" => [
                "input" => [
                    "-1 2"
                ],
                "errOutput" => ["Invalid row #1 '-1 2': item count(-1) should be greater than 0"],
                "expected" => 1,
            ],
            "invalid input: negative trades" => [
                "input" => [
                    "1 -2"
                ],
                "errOutput" => ["Invalid row #1 '1 -2': item trades(-2) should be greater than 0"],
                "expected" => 1,
            ],
            "invalid input: num count trades" => [
                "input" => [
                    "2 1",
                    "2 2"
                ],
                "errOutput" => ["Invalid row #2 '2 2': too few items"],
                "expected" => 1,
            ],
            "invalid input: value trades" => [
                "input" => [
                    "2 1",
                    "a 2 0"
                ],
                "errOutput" => ["Invalid row #2 'a 2 0': invalid format"],
                "expected" => 1,
            ],
            "invalid input: negative a trades" => [
                "input" => [
                    "2 1",
                    "-1 2 0 "
                ],
                "errOutput" => ["Invalid row #2 '-1 2 0': A(-1) should be greater than 0"],
                "expected" => 1,
            ],
            "invalid input: negative b trades" => [
                "input" => [
                    "2 1",
                    "1 -2 0"
                ],
                "errOutput" => ["Invalid row #2 '1 -2 0': B(-2) should be greater than 0"],
                "expected" => 1,
            ],
            "to few trades" => [
                "input" => [
                    "3 2",
                    "1 2 -1"
                ],
                "errOutput" => ["tree not filled"],
                "expected" => 1,
            ],
            "ex 1" => [
                "input" => "7 14
1 5 5
5 6 4
5 4 3
4 2 -3
2 5 -2
1 2 0
3 7 1
6 7 3
5 7 -1
1 6 4
3 6 -2
2 3 5
6 4 2
1 3 6",
                "output" => "YES
2 5 4 2",
                "expected" => 0,
            ],
            "ex 2" => [
                "input" => "7 14
1 5 5
5 6 4
5 4 3
4 2 -1
2 5 -2
1 2 0
3 7 1
6 7 3
5 7 -1
1 6 4
3 6 -2
2 3 5
6 4 2
1 3 6 ",
                "output" => "NO",
                "expected" => 0,
            ],
        ];
    }

    #[DataProvider("testRunDataProvider")]
    public function testRun(
        array|string $input,
        array|string $output = [],
        array|string $errOutput = [],
        int $expected = 0
    ): void {
        if (is_string($input)) {
            $input = explode("\n", $input);
        }
        if (is_string($output)) {
            $output = explode("\n", $output);
        }
        if (is_string($errOutput)) {
            $errOutput = explode("\n", $errOutput);
        }

        $mock = $this->getMockBuilder(GoProtect\Runner::class)
            ->disableOriginalConstructor()
            ->onlyMethods(["read", "write", "out", "error", "close", "closeAll"])
            ->getMock();

        $actualOutput = [];
        $actualErrOutput = [];
        $i = 0;

        $mock->expects($this->atMost(count($input) + 1))
            ->method("read")
            ->willReturnCallback(function () use (&$i, $input): string|false {
                return $input[$i++] ?? false;
            });

        $mock->expects($this->exactly(count($output)))
            ->method("out")
            ->willReturnCallback(function (string $str) use (&$actualOutput): void {
                $actualOutput[] = trim($str);
            });

        $mock->expects($this->exactly(count($errOutput)))
            ->method("error")
            ->willReturnCallback(function (string $str) use (&$actualErrOutput): void {
                $actualErrOutput[] = trim($str);
            });

        $this->assertEquals($expected, $mock->run());
        $this->assertEquals($output, $actualOutput);
        $this->assertEquals($errOutput, $actualErrOutput);
    }
}
