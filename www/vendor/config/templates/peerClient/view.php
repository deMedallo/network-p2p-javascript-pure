<?php
$fields = dataPage();


$Blockchain = new \demedallo\BlockchainPHP\Blockchain();

if(isset($api->fields->listConnect) && $api->fields->listConnect == true){
}else{
    $block = $Blockchain->getLastBlock(folder_blockchain."/peerClient.dat");
    $apiR->set('error', false);
    $block->data = json_decode($block->data);
    $apiR->set('data', $block);
}