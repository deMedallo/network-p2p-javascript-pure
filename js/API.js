const instance = axios.create({
  baseURL: '/blockchain-php/www',
  timeout: 20000,
  headers: {'X-Custom-Header': 'foobar'}
});


var API = {};
API.peers = [];
API.Nodes = [];
API.Peer = [];


API.addPeer = function(peerId){
    instance.post('/peer', {
      addPeer: peerId
    })
    .then(function (response) {
        //console.log(response.data);
        console.log('Nodo Agregado a la Red.');
    })
    .catch(function (error) {
        console.log(error);
    });
}

API.addPeerClient = function(clientId){
    instance.post('/peerClient', {
        addPeer: clientId
    })
    .then(function (response) {
        //console.log(response.data);
        console.log('Conexion Agregada.');
    })
    .catch(function (error) {
        console.log(error);
    });
}

API.Peers = function(callback){
    instance.get('/peer', {
        params: {
            
        }
    })
    .then(function (response) {
        //console.log(response.data);
        console.log('Cargando Nodos...');
        callback(response.data);
    })
    .catch(function (error) {
        console.log(error);
        callback(response);
    });
}

API.PeerByPrevHash = function(prevHash, callback){
    run = instance.get('/peer', {
        params: {
            hash: prevHash
        }
    })
    .then(function (response){
        return callback(response.data);
    })
    .catch(function (error) {
        return callback(error);
    });
}

API.NextPeerConn = function(prevHash){
    //console.log('NextPeerConn');
    //console.log('Conectando a nuevo nodo');
    if(API.peers.length <= 5){
        run = instance.get('/peer', {
            params: {
                hash: prevHash
            }
        })
        .then(function (response){
            //console.log('Nuevo nodo conectado');
            if(r.error == false && response.data.data.data){
                //console.log(response.data.data.data);
                API.peers.push(response.data.data.data);
            
                if(response.data.data.prevhash != '0000000000000000000000000000000000000000000000000000000000000000'){
                    API.NextPeerConn(response.data.data.prevhash);
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    
};

function getUrlParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return null;
    else
        return results[1];
};


API.ConnNodes = function(){
    console.log('ConnNodes');
    console.log(API.peers);
    console.log(API.peers.length);
    
    peers = [];
    connets = [];
    for (i = 0; i < API.peers.length; i++) {
        peerId = API.peers[i];
        console.log("Peer: ID: " + peerId);
        console.log("En lista: " + i);
        
        peer = new Peer(null, {
            debug: 2
        });
        peer.on('open', function (id) {
            MyPeerId = id;
            console.log('ID: ' + MyPeerId);
            API.addPeerClient(MyPeerId);
        });
        var conn = peer.connect(peerId, {
            reliable: true
        });
        
        conn.on('open', function (id) {
            console.log(peerId);
            //oppositePeer.peerId = peerId;
            status.innerHTML = "Connected to: " + peerId;
            console.log("Connected to: " + peerId)
            
                    // Recieve data (only messages)
                    conn.on('data', function (data) {
                        addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
                        //addMessage("<span class=\"peerMsg\">" + peerId + "</span> " + data);
                    });

                    // Handle close or error
                    conn.on('close', function () {
                        status.innerHTML = "Connection closed";
                    });
                    peer.on('disconnected', function () {
                        alert("Connection has been lost.");
                        peer.reconnect();
                    });
                    peer.on('error', function (err) {
                        alert('' + err)
                    });

                    // Check URL for comamnds that should be sent right away
                    command = getUrlParam("command");
                    if (command)
                        conn.send(command);

                    var cueString = "<span class=\"cueMsg\">Cue: </span>";
                    goButton.onclick = function () {
                        conn.send("Go");
                        console.log("Go signal sent");
                        addMessage(cueString + "Go");
                    };
                    resetButton.onclick = function () {
                        conn.send("Reset");
                        console.log("Reset signal sent");
                        addMessage(cueString + "Reset");
                    };
                    fadeButton.onclick = function () {
                        conn.send("Fade");
                        console.log("Fade signal sent");
                        addMessage(cueString + "Fade");
                    };
                    offButton.onclick = function () {
                        conn.send("Off");
                        console.log("Off signal sent");
                        addMessage(cueString + "Off");
                    };

                    // Listen for enter
                    sendMessageBox.onkeypress = function (e) {
                        var event = e || window.event;
                        var char = event.which || event.keyCode;
                        if (char == '13')
                            sendButton.click();
                    };
                    // Send message
                    sendButton.onclick = function () {
                        msg = sendMessageBox.value;
                        sendMessageBox.value = "";
                        conn.send(msg);
                        console.log("Sent: " + msg)
                        addMessage("<span class=\"selfMsg\">Self: </span> " + msg);
                    };
                    // Clear messages box
                    clearMsgsButton.onclick = function () {
                        clearMessages();
                    };
                    
                    
        
                    conn.send("Go");
                    console.log("Go signal sent");
                    addMessage(cueString + "Go");
                
        });
        
        connets.push(conn);
        /*
        var conn = peer.connect(destId, {
            reliable: true
        });
        conn.on('open', function () {
            oppositePeer.peerId = destId;
            status.innerHTML = "Connected to: " + destId;
            console.log("Connected to: " + destId)
            ready();
        });*/
    }
    API.Peer = connets;
}

API.TreePeers = function(){
    console.log('Cargando TreePeers (nodos)');
    var arrayPeers = [];
    instance.get('/peer', {
        params: {
            listConnect: 3
        }
    })
    .then(function (re) {
        r = re.data;
        console.log('Cargando Nodos...');
        if(r.error == false){
            console.log('Nodo mas reciente cargado...');
            console.log(r.data);
            API.Nodes = (r.data);
            for(i = 0; i < API.Nodes.length; i++) {
                console.log('Nuevo nodo agregado');
                API.peers.push(API.Nodes[i].data.peerId);
            };
            API.ConnNodes();
        }else{
            console.log('error: no se cargaron mas nodos.');
            console.log('Respuesta:');
            console.log(re.data);
        }
    })
    .catch(function (error) {
        console.log(error);
    });
};

API.SendAll = function(msg){
    console.log("Enviando mensaje a todos los nodos: " + msg);
    
    
    for(i = 0; i < API.Peer.length; i++) {
        API.Peer[i].send(msg);
    }
    
    //addMessage("Enviando mensaje a todos los nodos: " + msg);
    //addMessage(msg);
}

function clearMessages() {
    message.innerHTML = "";
    addMessage("Msgs cleared");
};
