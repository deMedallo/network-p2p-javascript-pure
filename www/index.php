<?php

header('Content-Type: application/json');
require __DIR__.'/vendor/autoload.php';


#$api = RunAPI();

$api = new apiBC();
$apiR = new apiResult();
$apiR->set('page', $api->page);
$apiR->set('fields', $api->fields);
$apiR->set('action', $api->action);


if(file_exists($api->pageFile)){
    include($api->pageFile);
}else{
    # echo "Error 404: {$api->pageFile}";
    # include('config/docs/site/errors/404.php');
}





#FINAL
echo json_encode($apiR, JSON_PRETTY_PRINT);
return json_encode($apiR, JSON_PRETTY_PRINT);