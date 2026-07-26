<?php

declare(strict_types=1);
/**
 * This file is part of Hyperf.
 *
 * @link     https://www.hyperf.io
 * @document https://hyperf.wiki
 * @contact  group@hyperf.io
 * @license  https://github.com/hyperf/hyperf/blob/master/LICENSE
 */
return [
    'generator' => [
        'amqp' => [
            'consumer' => [
                'namespace' => 'app\\Amqp\\Consumer',
            ],
            'producer' => [
                'namespace' => 'app\\Amqp\\Producer',
            ],
        ],
        'aspect' => [
            'namespace' => 'app\\Aspect',
        ],
        'command' => [
            'namespace' => 'app\\command',
        ],
        'controller' => [
            'namespace' => 'app\\http\\user\\controller\\v1',
        ],
        'job' => [
            'namespace' => 'app\\Job',
        ],
        'listener' => [
            'namespace' => 'app\\common\\listener',
        ],
        'middleware' => [
            'namespace' => 'app\\http\\common\\middleware',
        ],
        'Process' => [
            'namespace' => 'app\\Processes',
        ],
    ],
];
