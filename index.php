<?php

if (file_exists('vendor/_autoload.php')) {
    include_once 'vendor/autoload.php';
} else {
    include_once 'src/Error.php';
    include_once 'src/ImbalanceTree.php';
    include_once 'src/Node.php';
    include_once 'src/Runner.php';
    include_once 'src/Tree.php';
}

use GoProtect\Runner;

exit(new Runner()->run());