const instance = axios.create({
  baseURL: '/blockchain-php/www',
  timeout: 20000,
  headers: {'X-Custom-Header': 'foobar'}
});

var API = {};
API.connectStatus = false;
API.mePeer = null;
API.meConn = null;
API.peerId = null;
API.peers = [];
API.Nodes = {};
API.Peer = [];

API._statusLast = '';
API._statusHistory = [];
API.bcConnection = [];
API.bcPing = [];
API.hashHisory = [];
API._nodeDetect = {};
API._lastUpdate = new Date().getTime()/1000;
API.messages = [];
API.logs = [];

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

API.SendAll = function(msg){
    if(!msg.hash){ msg.hash = API.randomHash(); }
    if(!msg.from){ msg.from = API.peerId; }
    if(!msg.type){ msg.type = 'none'; }
    if(!msg.data){ msg.data = {}; }

    if(msg.type != 'none'){
        for (var k in API.Peer){
            if (typeof API.Peer[k] !== 'function') {
                if(API.Peer[k].open == true){
                    msg.to = API.Peer[k].peer;
                    API.Peer[k].send(msg);
                }
            }
        }
    }
}

API.randomHash = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 32; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

API.setStatus = function(msg){
    API._statusLast = msg;
    API._statusHistory.push(msg)
}

API.getStatus = function(){
    return API._statusLast;
}

API.getStatusHistory = function(){
    return API._statusHistory;
}

API.createConnection = function(peerId){
    if(!API.Peer[peerId]){
        if(!API._nodeDetect[peerId]){
            
        }else{
            delete API._nodeDetect[peerId];
        }
            
            
        var connection = API.mePeer.connect(peerId);
        /** ---- **/
        connection.on('open', function (id) {
            
            if(connection.open == false){
                API.addMessage({
                    from: 'System',
                    to: 'My',
                    text: 'No se encontro nodo: ID - '+ peerId
                });
                return false;
            }
            
            API.Peer[connection.peer] = connection;
            var itemNew = {};
            itemNew.peerId = connection.peer;
            itemNew.connect = 2;
            API.Nodes[connection.peer] = itemNew;
            
            var itemNew = {};
            itemNew.hash = API.randomHash();
            itemNew.from = API.peerId;
            itemNew.to = connection.peer;
            itemNew.type = 'connection';
            
            /** ---- **/
            connection.send(itemNew);
            connection.on('data', function (data) {
                API.addMessage({
                    from: 'System',
                    to: 'My',
                    text: "Info Recibida"
                });
                API.ValidateDataRecibe(data);
            });
            
            connection.on('close', function () {
                //API.Nodes[connection.peer].connect = false;
                delete API.Nodes[connection.peer];
            });
            connection.on('disconnected', function () {
                API.addMessage({
                    from: 'System',
                    to: 'My',
                    text: "Connection has been lost."
                });
                connection.reconnect();
            });
            
            connection.on('error', function (err) {
                API.addMessage({
                    from: 'System',
                    to: 'My',
                    text: err
                });
                //API.setStatus('' + err)
            });
            
        });
    }
}

API.getNodesStatus = function(){
    return API.Nodes;
};

API.nodesEnables = function(){
    return API._nodeDetect;
}

API.updateNodes = function(){
    if(API.mePeer.disconnected == false){
        var update = new Date().getTime()/1000;
        
        if((API._lastUpdate+10) <= update){
            API._lastUpdate = update;
            API.addLog({
                text: 'Compartiendo nodos...'
            });
            
            var itemNew = {};
            //itemNew.hash = API.randomHash();
            itemNew.from = API.peerId;
            itemNew.type = 'nodesList';
            itemNew.data = API.Nodes;
            
            API.SendAll(itemNew);
        }else{
            API.addLog({
                text: 'buuu'
            });
        }
    }else{
        /*
        API.addMessage({
            from: 'System',
            to: 'My',
            text: 'No estas conectado.',
        });*/
    }
}

API.sendPing = function(peerId){
    var ping = {};
    ping.hash = API.randomHash();
    ping.type = 'ping';
    ping.to = peerId;
    API.bcPing.push(ping.hash);
    API.SendAll(ping);
}

API.ValidateDataRecibe = function(data){
    API.addLog({
        text: 'Validando info recibida'
    });    
    if(!data.from || !data.to || !data.hash || !data.type){
        console.log('Incompleta');
        console.log(data);
    }else{
        
        switch (data.type) {
            case 'nodesList':
                if(API.hashHisory.indexOf(data.hash) <= -1){
                    API.addLog({
                        text: 'Validar nodesList'
                    });
            
                    var target = data.data;
                    for (var k in target){
                        if (typeof target[k] !== 'function') {
                            if(!API._nodeDetect[target[k].peerId] && target[k].peerId != API.peerId && !API.Peer[target[k].peerId]){
                                API._nodeDetect[target[k].peerId] = target[k];
                                
                                
                                API.addMessage({
                                    from: 'System',
                                    to: 'My',
                                    text: 'Nuevo nodo: ID - '+ target[k].peerId
                                });
                            }                            
                        }
                    }
                }
                break;
            case 'connectionResponse':
                if(API.bcConnection.indexOf(data.hash) <= -1){
                    if(data.to == API.peerId){
                        API.addMessage({
                            from: data.from,
                            to: 'My',
                            text: 'Creando Conexion'
                        });
                        
                        if(!API.Nodes[data.from]){
                            console.log('No existe Nodo.');
                        }else{
                            API.addLog({
                                text: 'Estatus cambiado: ' + data.from
                            });
                            
                            API.Nodes[data.from].connect = 1;
                            API.bcConnection.push(data.hash);
                            
                            var itemNew = {};
                            itemNew.hash = data.hash;
                            itemNew.from = API.peerId;
                            itemNew.to = data.from;
                            itemNew.type = 'connectionResponse';
                            itemNew.response = true;
                            
                            API.Peer[data.from].send(itemNew);
                        }
                    }
                }else{
                    if(!data.response){
                        console.log('Ya existe');
                    }else{
                        if(data.response == true){
                            API.addMessage({
                                from: 'System',
                                to: 'My',
                                text: 'Conectado con: '+ data.from
                            });
                            
                            API.Nodes[data.from].connect = 1;
                            
                            var itemNew = {};
                            itemNew.hash = API.randomHash();
                            itemNew.from = API.peerId;
                            itemNew.to = data.from;
                            itemNew.type = 'nodesList';
                            itemNew.data = API.Nodes;
                            API.Peer[data.from].send(itemNew);
                            API.addMessage({
                                from: API.peerId,
                                to: data.from,
                                text: 'Compartiendo listado de nodos. '+ data.from
                            });
                            
                        }
                    }
                }
                break;
            case 'connection':
                if(API.bcConnection.indexOf(data.hash) <= -1){
                    if(data.to == API.peerId){
                        API.addMessage({
                            from: data.from,
                            to: 'My',
                            text: 'Peticion de conexion recibida: '
                        });
                        API.addMessage({
                            from: 'My',
                            to: data.from,
                            text: 'Enviando confirmacion de conexion'
                        });
                        
                        var itemNew = {};
                        itemNew.hash = API.randomHash();
                        itemNew.from = API.peerId;
                        itemNew.to = data.from;
                        itemNew.type = 'connectionResponse';
                        
                        API.addLog({
                            text: 'createConnection: '
                        });
                        var connectionResponse = API.mePeer.connect(data.from);
                        
                        connectionResponse.on('open', function (id) {
                            var itemNew = {};
                            itemNew.hash = API.randomHash();
                            itemNew.from = API.peerId;
                            itemNew.to = connectionResponse.peer;
                            itemNew.type = 'connectionResponse';
                            
                            connectionResponse.send(itemNew);
                            connectionResponse.on('data', function (data) {
                                API.addLog({
                                    text: "Data recieved Response Conection"
                                });
            
                                console.log(data);
                            });
                            /** ---- **/
                            
                            var itemNew = {};
                            itemNew.hash = API.randomHash();
                            itemNew.from = API.peerId;
                            itemNew.to = data.from;
                            itemNew.type = 'connectionResponse';
                            
                        });
                        
                        if(!API.Peer[connectionResponse.peer]){
                            
                            API.Peer[connectionResponse.peer] = connectionResponse;
                            
                            var itemNew = {};
                            itemNew.peerId = connectionResponse.peer;
                            itemNew.connect = 0;
                            API.Nodes[connectionResponse.peer] = itemNew;
                            
                        }
                    }
                }
                break;
            case 'message':
                break;
            case 'pingResponse':
                if(API.bcPing.indexOf(data.hash) <= -1){
                    API.addLog({
                        text: 'No encontrado'
                    });
                }else{
                    API.addLog({
                        text: 'Respuesta de ping encontrada. ' + data.hash
                    });
                    
                    API.addMessage({
                        type: 'success',
                        from: data.from,
                        to: data.to,
                        text: 'Ping recibido.'
                    });
                }
                break;
            case 'ping':
                if(API.bcPing.indexOf(data.hash) <= -1){
                    if(data.to == API.peerId){
                        API.addLog({
                            text: 'Ping recibido por: ' + data.from
                        });
                        
                        API.addLog({
                            text: 'Enviando confirmacion de ping a: ' + data.from
                        });
                        data.type = 'pingResponse';
                        API.SendAll(data);
                        API.bcPing.push(data.hash);
                        //console.addLog(JSON.stringify(data));
                        //API.pingPeerResponse(data);
                    }
                    /*
                    else if(data.to == API.peerId && data.response == true){
                        if(API.hashHisory.indexOf(data.hash) <= -1){
                            alert('Recibida respuesta de ping ' + data.from);
                            API.hashHisory.push(data.hash);
                        }
                    }
                    else{
                        if(API.hashHisory.indexOf(data.hash) <= -1){
                            console.log('Retransamitir ');
                            API.bcPing.push(data.hash);
                        }
                    }*/
                }else{
                    console.log('log addicional');
                }
                break;
            default:
                break;
        };
    }
}

API.createMyNode = function(){
    //'Creando nodo'
    var mePeer = new Peer(null, {
        debug: 2
    });
    
    mePeer.on('open', function (id) {
        API.setStatus('Nodo Creado, ID: ' + id);
        API.addLog({
            text: 'Nodo Creado, ID: ' + id
        });
        API.peerId = id;
    });
    
    mePeer.on('error', function (err) {
        if (err.type === 'unavailable-id') {
            mePeer.reconnect();
        }
        else{
            API.setStatus(id);
            console.log(err);
            API.addLog({
                text: error
            });
        }
    });

    mePeer.on('open', function () {
        API.setStatus("En espera de conexión...");
        API.addLog({
            text: "En espera de conexión..."
        });
    });
    
    mePeer.on('connection', function (c) {
        if (API.MeConn != null) {
            API.setStatus("Ya conectado...");
            
            c.send("Ya conectado...");
            c.close();
            return;
        }else{
            var meConn = c;
            API.setStatus("Conectado");
            API.addLog({
                text: "Conectado"
            });
            API.connectStatus = true;
            
            
            
            setInterval(function(){
                API.updateNodes();
            }, 25000);
            
            meConn.on('data', function (data) {
                console.log('Info Recibida');
                API.ValidateDataRecibe(data);
            });
        
            meConn.on('close', function () {
                API.setStatus("Connection reset, Awaiting connection...");
                API.addLog({
                    text: "Connection reset, Awaiting connection..."
                });
                meConn = null;
                API.connectStatus = false;
            });
            mePeer.on('disconnected', function () {
                API.setStatus("Connection has been lost.");
                API.addLog({
                    text: "Connection has been lost."
                });
                mePeer.reconnect();
            });
            
            mePeer.on('error', function (err) {
                API.setStatus('' + err)
                API.addLog({
                    text: err
                });
            });
            
            //API.Peer.push(meConn);
            
            API.meConn = meConn;
        }
        /*
            datos = {
                hash: API.randomHash(),
                type: 'firstConnect'
            };
            console.log('Solicitando Credenciales.');
            console.log(datos);
            c.send(datos);*/
    });
    
    API.mePeer = mePeer;
}

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

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

API.getLogs = function(){
    return API.logs;
}

API.addLog = function(log){
    if(!log.text){
        
    }else{
        var item = {};
        item.timestamp = new Date().getTime();
        item.text = log.text;
        
        API.logs.reverse();
        API.logs.push(item);
        API.logs.reverse();
    }
}

API.clearLogs = function() {
    API.logs = [];
    API.addLog({
        text: 'Logs cleared'
    });
};

API.getMessages = function(){
    return API.messages;
}

API.addMessage = function(msg){
    if(!msg.type){ msg.type = 'secondary'; }
    
    if(!msg.text || !msg.from || !msg.to){
        
    }else{
        var item = {};
        item.type = msg.type;
        item.from = msg.from;
        item.to = msg.to;
        item.text = msg.text;
        item.timestamp = new Date().getTime();
        
        API.messages.reverse();
        API.messages.push(item);
        API.messages.reverse();
    }
}

API.clearMessages = function() {
    API.messages = [];
    API.addMessage({
        from: 'System',
        to: 'My',
        text: 'Msgs cleared'
    });
};

