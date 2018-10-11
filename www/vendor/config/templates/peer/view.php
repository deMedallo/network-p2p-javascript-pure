<?php
$fields = dataPage();
$Blockchain = new \demedallo\BlockchainPHP\Blockchain();


if(isset($api->fields->prevhash) && $api->fields->prevhash <> ''){
    $block = $Blockchain->getBlockByPrevHash(folder_blockchain."/peer.dat", $api->fields->prevhash);
    $data = $block->getJson();
    $apiR->set('error', $block->hasError());
    $apiR->set('data', $data);
}
else if(isset($api->fields->hash) && $api->fields->hash <> ''){
    $block = $Blockchain->getBlockByHash(folder_blockchain."/peer.dat", $api->fields->hash);
    $data = $block->getJson();
    $apiR->set('error', $block->hasError());
    $apiR->set('data', $data);
}else{
    $block = $Blockchain->getLastBlock(folder_blockchain."/peer.dat");
    $apiR->set('error', false);
    $block->data = json_decode($block->data);
    $apiR->set('data', $block);
}
