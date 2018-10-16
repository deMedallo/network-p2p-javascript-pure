console.log("%cImportante! %cEsta consola es para desarrollo avanzado, Necesitas conocimientos en JavaScript, Bootstrap, jQuery, VUE y PeerJS.\n Si no sabes que estas haciendo te recomendamos cerrarla ya que pueden estan en riesgo tus datos.", "color: red; font-size:25px;", "color: blue; font-size:12px;");

const instance = axios.create({
  baseURL: '/blockchain-php/www',
  timeout: 20000,
  headers: {'X-Custom-Header': 'foobar'}
});

var API = {};
API.connectStatus = 0;
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
API.myRecibeMessage = [];
API.myMessages = {};
API._nodesShar = {};

API.commands = {
    ping: {
        fields: {
            'nodeId': {
                type: 'string',
                position: 0,
                help: 'Nodo de destino para ping.',
            }
        },
        result: 'sendPing:nodeId'
    },
    sendMessage: {
        fields: {
            'nodeId': {
                type: 'string',
                position: 0,
                help: 'Nodo de destino.',
            },
            'text': {
                type: 'string',
                position: 1,
                help: 'Texto de destino.',
            }
        },
        result: 'sendMessageConsole:nodeId,text'
    },
    listPeer: {
        fields: {
            'infoComplete': {
                type: 'boolean',
                position: 0,
                help: 'Mostrar completo (True) / Solo nombres (False)',
            }
        },
        result: 'nodesEnablesConsole:infoComplete'
    }
};

API.nodesEnablesConsole = function(json=false){
    var textResult = '';
    
    if(json == false){
        var finalArray = [];
        var target2 = API.Nodes;
        for (var k in target2){
            if (typeof target2[k] !== 'function') {
                var idPeer = target2[k].peerId;
                finalArray.push(idPeer);
            }
        }
        textResult = 'Listado de nodos: ' + finalArray.join(',');
    }else{
        textResult = JSON.stringify(API.Nodes);
    }
    
    API.addMessage({
        type: 'info',
        from: 'System',
        to: 'My',
        text: textResult
    });
    return false;
}

API.addPeer = function(peerId){
    instance.post('/peer', {
      addPeer: peerId
    })
    .then(function (response) {
        //console.log('Nodo Agregado a la Red.');
    })
    .catch(function (error) {
        console.log(error);
    });
}

API.SendShared = function(msg){
    if(!msg.to){
        console.log('Falta el destino:');
        return false;
    }
    if(!msg.hash){ msg.hash = API.randomHash(); }
    if(!msg.from){ msg.from = API.peerId; }
    if(!msg.type){ msg.type = 'none'; }
    if(!msg.data){ msg.data = {}; }
    if(!msg.txHistory){ msg.txHistory = []; }
    
    if(msg.type != 'none'){
        for (var k in API.Peer){
            if (typeof API.Peer[k] !== 'function') {
                if(API.Peer[k].open == true){
                    API.Peer[k].send(msg);
                }
            }
        }
    }
}

API.sendMessageConsole = function(toInput,textInput){
    API.sendMessage({
        to: toInput,
        text: textInput
    });
}

API.sendMessage = function(msg){
    if(!msg.to || !msg.text){
        console.log('Faltan campos del mensaje.');
        return false;
    }
    
    msg.hash = API.randomHash();
    msg.type = 'message';
    
    API.SendShared(msg);
    msg.recibe = false;
    API.myMessages[msg.hash] = msg;
    
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

API.nodesShar = function(){
    var target1 = API._nodeDetect;
    for (var k in target1){
        if (typeof target1[k] !== 'function') {
            var idPeer = target1[k].peerId;
            if(!API._nodesShar[idPeer]){
                API._nodesShar[idPeer] = {};
                API._nodesShar[idPeer].peerId = idPeer;
            }
        }
    }
    var target2 = API.Nodes;
    for (var k in target2){
        if (typeof target2[k] !== 'function') {
            var idPeer = target2[k].peerId;
            if(!API._nodesShar[idPeer]){
                API._nodesShar[idPeer] = {};
                API._nodesShar[idPeer].peerId = idPeer;
            }
        }
    }
    return API._nodesShar;
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
                //API.Nodes[connection.peer].connect = 3;
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
                API.Nodes[connection.peer].connect = 2;
                connection.reconnect();
            });
            
            connection.on('error', function (err) {
                API.addMessage({
                    from: 'System',
                    to: 'My',
                    text: err
                });
                API.Nodes[connection.peer].connect = 0;
                //API.setStatus('' + err)
                delete API.Nodes[connection.peer];
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
                text: 'Compartiendo nodos...',
                icon: 'fa fa-flag-checkered'
            });
            
            var itemNew = {};
            //itemNew.hash = API.randomHash();
            itemNew.from = API.peerId;
            itemNew.type = 'nodesList';
            itemNew.data = API.nodesShar();
            
            API.SendAll(itemNew);
        }else{
            API.addLog({
                text: 'buuu'
            });
        }
    }
}

API.sendPing = function(peerId){
    var ping = {};
    ping.hash = API.randomHash();
    ping.type = 'ping';
    ping.from = API.peerId;
    ping.to = peerId;
    API.bcPing.push(ping.hash);
    API.SendShared(ping);
}

API.getMyMessages = function(){
    return API.myMessages;
}

API.ValidateDataRecibe = function(data){
    if(!data.from || !data.to || !data.hash || !data.type){
        console.log('Incompleta');
        console.log(data);
    }else{
        if(data.from == API.peerId){
            console.log('Otra vez tu...');
        }
        else {
            if(data.to == API.peerId){
                console.log('Enviada para mi');
                
                if(API.hashHisory.indexOf(data.hash) <= -1){
                    switch (data.type) {
                        case 'nodesList':
                            API.addLog({
                                text: 'Validar nodesList',
                                icon: 'fa fa-connectdevelop'
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
                            break;
                        case 'connectionResponse':
                            if(API.bcConnection.indexOf(data.hash) <= -1){
                                if(data.to == API.peerId){
                                    API.addLog({
                                        from: data.from,
                                        to: 'My',
                                        text: 'Creando Conexion',
                                        icon: 'fa fa-connectdevelop'
                                    });
                                    
                                    if(!API.Nodes[data.from]){
                                        console.log('No existe Nodo.');
                                    }else{
                                        API.addLog({
                                            text: 'Conectado : ' + data.from,
                                            icon: 'fa fa-sign-in'
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
                                        API.addLog({
                                            from: API.peerId,
                                            to: data.from,
                                            text: 'Compartiendo listado de nodos. '+ data.from,
                                            icon: 'fa fa-connectdevelop'
                                        });
                                        
                                    }
                                }
                            }
                            break;
                        case 'connection':
                            if(API.bcConnection.indexOf(data.hash) <= -1){
                                API.addMessage({
                                    from: data.from,
                                    to: 'My',
                                    text: 'Peticion de conexion recibida: ',
                                    icon: 'fa fa-flag-checkered'
                                });
                                API.addMessage({
                                    from: 'My',
                                    to: data.from,
                                    text: 'Enviando confirmacion de conexion',
                                    icon: 'fa fa-connectdevelop'
                                });
                                
                                var itemNew = {};
                                itemNew.hash = API.randomHash();
                                itemNew.from = API.peerId;
                                itemNew.to = data.from;
                                itemNew.type = 'connectionResponse';
                                
                                API.addLog({
                                    text: 'createConnection: ',
                                    icon: 'fa fa-sign-in'
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
                                        API.ValidateDataRecibe(data);
                                    });
                                    
                                    var itemNew = {};
                                    itemNew.hash = API.randomHash();
                                    itemNew.from = API.peerId;
                                    itemNew.to = data.from;
                                    itemNew.type = 'connectionResponse';
                                    
                                    
                                    
                                    connectionResponse.on('close', function () {
                                        delete API.Nodes[connectionResponse.peer];
                                    });
                                    connectionResponse.on('disconnected', function () {
                                        API.addMessage({
                                            from: 'System',
                                            to: 'My',
                                            text: "connectionResponse has been lost."
                                        });
                                        API.Nodes[connectionResponse.peer].connect = 2;
                                        connectionResponse.reconnect();
                                    });
                                    
                                    connectionResponse.on('error', function (err) {
                                        API.addMessage({
                                            from: 'System',
                                            to: 'My',
                                            text: err
                                        });
                                        API.Nodes[connectionResponse.peer].connect = 0;
                                        delete API.Nodes[connectionResponse.peer];
                                    });
                                });
                                
                                if(!API.Peer[connectionResponse.peer]){
                                    API.Peer[connectionResponse.peer] = connectionResponse;
                                    var itemNew = {};
                                    itemNew.peerId = connectionResponse.peer;
                                    itemNew.connect = 0;
                                    API.Nodes[connectionResponse.peer] = itemNew;
                                }
                            }
                            break;
                        case 'messageRecibe':
                            if(data.recibe == true && API.myMessages[data.hash].recibe == false){
                                API.addMessage({
                                    type: 'warning',
                                    from: data.from,
                                    to: 'My',
                                    text: 'El mensaje llego a su destino ' + data.hash
                                });
                                API.myMessages[data.hash].recibe = true;
                            }
                            break;
                        case 'message':
                            if(API.myRecibeMessage.indexOf(data.hash) <= -1){                                
                                API.addMessage({
                                    type: 'success',
                                    from: data.from,
                                    to: 'My',
                                    text: data.text
                                });
                                
                                API.myMessages[data.hash] = data;
                                /* Enviar Mensaje */
                                API.SendShared({
                                    hash: data.hash,
                                    type: 'messageRecibe',
                                    to: data.from,
                                    recibe: true
                                });
                                
                                API.myRecibeMessage[data.hash] = data;
                            }
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
                                
                                if(data.response == true){
                                    API.addMessage({
                                        type: 'success',
                                        from: data.from,
                                        to: 'My',
                                        text: 'Ping recibido.',
                                        icon: 'fa fa-check'
                                    });
                                }
                            }
                            break;
                        case 'ping':
                            if(API.bcPing.indexOf(data.hash) <= -1){                                
                                API.addMessage({
                                    type: 'info',
                                    from: data.from,
                                    to: 'My',
                                    text: 'Ping recibido.',
                                    icon: 'fa fa-check-circle'
                                });
                                API.addMessage({
                                    type: 'info',
                                    from: 'My',
                                    to: data.from,
                                    text: 'Enviando confirmacion de ping. ',
                                    icon: 'fa fa-exchange'
                                });
                                
                                data.type = 'pingResponse';
                                data.to = data.from;
                                data.from = API.peerId;
                                data.response = true;
                                API.SendShared(data);
                                API.bcPing.push(data.hash);
                            }else{
                                console.log('log addicional ping');
                            }
                            break;
                        default:
                            break;
                    };
                    API.hashHisory.push(data.hash);
                }else{
                    console.log('log addicional');
                }
            }else{
                if(API.hashHisory.indexOf(data.hash) <= -1){                    
                    API.addLog({
                        text: 'Se va a firmar y a retransmiir...'
                    });
                    
                    if(data.txHistory.length >= 50){
                        console.log('demaciadas tx');
                        console.log(data.txHistory.length);
                    }else{
                        API.SendShared(data);
                    }
                    /*
                    
                    data.txHistory.push({
                        hash: API.randomHash(),
                        peerId: API.peerId
                    });
                    API.SendShared(data);*/
                    
                }else{
                    API.SendShared(data);
                };
            };
        }
    }
}

API.console = function(lineCode){
    if(lineCode != ''){
        var porciones = lineCode.split(' ');
        var command = porciones[0];
        
        if(!API.commands[command]){
            API.addMessage({
                type: 'danger',
                from: 'System',
                to: 'My',
                text: 'El comando no existe.'
            });
        }else{
            var target = API.commands[command].fields;
            var valuesComm = {};
            for (var k in target){
                if (typeof target[k] !== 'function') {
                    var item = target[k].position + 1;
                    if(!porciones[item]){
                        console.log('Falta valor');
                        console.log(k);
                        
                        API.addMessage({
                            type: 'danger',
                            from: 'System',
                            to: 'My',
                            text: 'Falta valor ' + k + '. Ayuda: ' + target[k].help
                        });
                    }else{
                        valuesComm[k] = porciones[item];
                    }
                }
            }
            
            var functi = API.commands[command].result.split(':');
            var comand = functi[1].split(',');            
            
            console.log('Creando function');
            
            var parammms = [];
            for (var a in comand){
                if (typeof comand[a] !== 'function') {
                    if(!valuesComm[comand[a]]){
                        console.log('Faltan parametros');
                    }else{
                        parammms.push("'" + valuesComm[comand[a]] + "'")
                    }
                }
            }
            
            var parammms = parammms.join(',');
            var functionSmall = 'API.' + functi[0];
            var functionFull = functionSmall + '(' + parammms + ')';
            
            functionSmall = eval(functionSmall);
                
            if (typeof functionSmall == 'function') {
                console.log('isFunction');
                functionFull = eval(functionFull);
                console.log(functionFull);
            }
        }
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
            API.setStatus('Error: ');
            console.log(err);
            API.addLog({
                text: error
            });
            API.connectStatus = 2;
        }
    });

    mePeer.on('open', function () {
        API.setStatus("En espera de conexión...");
        API.addLog({
            text: "En espera de conexión...",
            icon: 'fa fa-spinner',
        });
        API.connectStatus = 2;
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
                text: "Conectado",
                icon: 'fa fa-plug'
            });
            API.connectStatus = 1;
            
            
            
            setInterval(function(){
                API.updateNodes();
            }, 25000);
            
            meConn.on('data', function (data) {
                API.ValidateDataRecibe(data);
            });
        
            meConn.on('close', function () {
                API.setStatus("Connection reset, Awaiting connection...");
                API.addLog({
                    text: "Connection reset, Awaiting connection...",
                    icon: 'fa fa-repeat'
                });
                meConn = null;
                API.connectStatus = 2;
            });
            mePeer.on('disconnected', function () {
                API.setStatus("Connection has been lost.");
                API.addLog({
                    text: "Connection has been lost.",
                    icon: 'fa fa-exclamation-circle'
                });
                API.connectStatus = 2;
                mePeer.reconnect();
            });
            
            mePeer.on('error', function (err) {
                API.setStatus('' + err)
                API.addLog({
                    text: err,
                    icon: 'fa fa-exclamation-circle'
                });
                API.connectStatus = 0;
            });
            
            API.meConn = meConn;
        }
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
    if(!log.icon){ log.icon = 'fa '; }
    
    if(!log.text){
        
    }else{
        var item = {};
        item.timestamp = new Date().getTime();
        item.text = log.text;
        item.icon = log.icon;
        
        API.logs.reverse();
        API.logs.push(item);
        API.logs.reverse();
    }
}

API.clearLogs = function() {
    API.logs = [];
    API.addLog({
        text: 'Logs cleared',
        icon: 'fa fa-eraser'
    });
};

API.getMessages = function(){
    return API.messages;
}

API.addMessage = function(msg){
    if(!msg.type){ msg.type = 'secondary'; }
    if(!msg.icon){ msg.icon = 'fa '; }
    
    if(!msg.text || !msg.from || !msg.to){
        
    }else{
        var item = {};
        item.type = msg.type;
        item.from = msg.from;
        item.to = msg.to;
        item.text = msg.text;
        item.icon = msg.icon;
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

API.detectCodeConsole = function(e, element){
    if (e.keyCode == 13) {
        console.log(e);
        console.log(element);
        if(!element.value){
            console.log('No hay valor');
        }else{
            console.log('Si encontro valor');
            this.console(element.value);
        }
        return false;
    }
}