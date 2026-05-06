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
                "errOutput" => ["Invalid row #1 '1 -2': trades count(-2) should be greater than 0"],
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
            "invalid input: negative A trade id" => [
                "input" => [
                    "2 1",
                    "-1 2 0 "
                ],
                "errOutput" => ["Invalid row #2 '-1 2 0': Id(-1) should be greater than 0"],
                "expected" => 1,
            ],
            "invalid input: negative B trade id" => [
                "input" => [
                    "2 1",
                    "1 -2 0"
                ],
                "errOutput" => ["Invalid row #2 '1 -2 0': Id(-2) should be greater than 0"],
                "expected" => 1,
            ],
            "invalid input: overflown A trade id" => [
                "input" => [
                    "3 1",
                    "4 2 0 "
                ],
                "errOutput" => ["Invalid row #2 '4 2 0': Id(4) should be less than or equals 3"],
                "expected" => 1,
            ],
            "invalid input: overflown B trade id" => [
                "input" => [
                    "2 1",
                    "1 3 0"
                ],
                "errOutput" => ["Invalid row #2 '1 3 0': Id(3) should be less than or equals 2"],
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
            "ex 0" => [
                "input" => "14 14
1 2 100
1 3 101
1 4 102
2 5 200
2 6 201
2 7 202
5 11 300
5 12 301
6 13 302
3 8 203
4 9 204
9 1 303
10 14 304
4 10 206",
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

        $prepareOutput = function (array &$output, string $str) {
            $str
                |> trim(...)
                |> (fn($x) => explode("\n", $x))
                |> (fn($x) => array_map("trim", $x))
                |> (function ($x) use (&$output) {
                return array_push($output, ...$x);
            });
        };

        $mock->expects($this->atMost(count($output)))
            ->method("out")
            ->willReturnCallback(function (string $str) use (&$actualOutput, $prepareOutput): void {
                $prepareOutput($actualOutput, $str);
            });

        $mock->expects($this->atMost(count($errOutput)))
            ->method("error")
            ->willReturnCallback(function (string $str) use (&$actualErrOutput, $prepareOutput): void {
                $prepareOutput($actualErrOutput, $str);
            });

        $this->assertEquals($expected, $mock->run());
        $this->assertEquals($output, $actualOutput);
        $this->assertEquals($errOutput, $actualErrOutput);
    }
}
