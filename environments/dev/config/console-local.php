<?php

$params = require(__DIR__ . '/params-local.php');
$db = require(__DIR__ . '/db-local.php');

$config = [
    'components' => [
        'db' => $db,
    ],
    'params' => $params,
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
    ];
}

return $config;
