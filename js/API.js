const instance = axios.create({
  baseURL: '/blockchain-php/www',
  timeout: 20000,
  headers: {'X-Custom-Header': 'foobar'}
});


var API = {};
API.peers = [];
API.Nodes = {};
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


API.SendAll = function(msg){
    if(!msg.type){
        
    }else{
        if(msg.type == 'message' && msg.text){
            for(i = 0; i < API.Peer.length; i++) {
                API.Peer[i].send(msg);
            }
        }else{
            var target = API.Peer;
            for (var k in target){
                if (typeof target[k] !== 'function') {
                    if(API.Peer[k].open == true){
                        API.Peer[k].send(msg);
                    }
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


function clearMessages() {
    message.innerHTML = "";
    addMessage("Msgs cleared");
};
