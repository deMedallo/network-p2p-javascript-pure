<?php
$fields = dataPage();

$Blockchain = new \demedallo\BlockchainPHP\Blockchain();

if(isset($api->fields->addPeer) && $api->fields->addPeer <> ''){
    $item = new stdClass();
    $item->peerId = $api->fields->addPeer;
    $apiR->set('item', $item);
    $item = json_encode($item);
    $block = $Blockchain->addBlock(folder_blockchain."/peerClient.dat", $item);
    
    $apiR->set('msg', 'Agregado a la red.');
    $apiR->set('error', false);
}
