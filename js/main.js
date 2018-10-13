
const createWalletPage = Vue.component('createWalletPage', {
    methods: {
        SendMessage(){
            var self = this;
            self.$parent.sendMessage();
        }
    },
	template: `
        <div>
            <div class="row">
                <div class="col-sm-12">
                    <h2>Crear Billetera</h2>
                    <hr>
                </div>
                <div class="col-sm-12">
                    <form>
                      <div class="form-group">
                        <label for="exampleInputEmail1">Usuario</label>
                        <input type="text" class="form-control" aria-describedby="nickHelp" placeholder="Usuario / Nick">
                        <small id="nickHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                      </div>
                      <div class="form-group">
                        <label for="exampleTextarea">Semilla</label>
                        <textarea class="form-control" id="exampleTextarea" rows="3"></textarea>
                      </div>
                      <div class="form-group">
                        <label for="exampleSelect1">Red</label>
                        <select class="form-control" id="exampleSelect1">
                          <option value="1">MainNet</option>
                          <option value="2">TestNet</option>
                        </select>
                      </div>
                      <button type="submit" class="btn btn-primary">Submit</button>
                    </form>
                </div>
                <div class="col-sm-12">
                    <table class="table">
                        <tr>
                            <th>Address</th>
                            <td></td>
                        </tr>
                        <tr>
                            <th>Private Key</th>
                            <td></td>
                        </tr>
                        <tr>
                            <th>Public Key</th>
                            <td></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
	`
});
const homePage = Vue.component('homePage', {
    methods: {
        SendMessage(){
            var self = this;
            self.$parent.sendMessage();
        }
    },
	template: `
        <div>
            <div class="col-sm-12 pre-scrollable" style="max-height: calc(50vh);min-height: calc(50vh);">
                <div v-for="msg in $parent.messages">
                    <div v-bind:class="'alert alert-' + msg.type " >
                      <strong>{{ msg.title }}</strong> {{ msg.text }}
                    </div>
                </div>
            </div>
            <div class="col-sm-12">
                <textarea class="form-control" v-model="$parent.message"></textarea>
                <!-- <button @click="SendMessage" class=\"btn btn-info\">Enviar</button> -->
            </div>
        </div>
	`
});

const routes = [
	{ path: '/', name: 'Home', component: homePage },
	{ path: '/createWallet', name: 'createWallet', component: createWalletPage },
];

const router = new VueRouter({
  routes
})

var Principal = new Vue({
	el: '#app',
	router: router,
	components: {
        'homePage': homePage
	},
	data: {
		connect: false,
		hashHisory: [],
		bcPing: [],
		bcMessage: [],
		totalConnect: 0,
        peersTotal: 0,
		messages: [],
		message: '',
		lastLog: '',
		logs: [],
		peers: [],
		search_text: '',
		nodes: API.Nodes,
		MePeerId: '',
		MeConn: null,
		messageStatus: '',
		MePeer: null,
	},
	created() {
		var self = this;
        self.createMyNode();
        self.Conectar();
	},
	mounted() {
	},
	watch: {
		//token(newName) { localStorage.token = newName; }
	},
	methods: {
        pingPeer(peerId){
            var self = this;
            
            var ping = {};
            ping.type = 'ping';
            ping.from = self.MePeerId;
            ping.to = peerId;
            
            
            self.sendAll(ping);
        },
        messagePeer(peerId){
            var self = this;
            
            var msg = {};
            msg.type = 'message';
            msg.from = self.MePeerId;
            msg.to = peerId;
            msg.text = self.message;
            
            self.addMessage(msg.text, 'Enviando: ', 'info');
            
            self.sendAll(msg);
        },
        pingPeerResponse(data){
            var self = this;
            
            self.bcPing[data.hash] = data;
            var ping = {};
            ping.peerId = self.MePeerId;
            ping.hash = data.hash;
            ping.type = 'ping';
            ping.from = data.peerId;
            ping.to = self.MePeerId;
            ping.response = true;
            
            API.SendAll(ping);
        },
        messageResponse(data){
            console.log('messageResponse');
            var self = this;
            
            self.bcPing[data.hash] = data;
            var msg = {};
            msg.peerId = self.MePeerId;
            msg.hash = data.hash;
            msg.text = data.text;
            msg.type = 'message';
            msg.from = data.peerId;
            msg.to = self.MePeerId;
            msg.response = true;
            
            API.SendAll(msg);
        },
        createMyNode(){
            var self = this;
            self.addLog('Creando nodo', 'deMedallo: ', 'secondary');
            self.MePeer = new Peer(null, {
                debug: 2
            });
            self.MePeer.on('open', function (id) {
                self.MePeerId = id;
                self.addLog(self.MePeerId, 'Nodo Creado: ', 'default');
                API.addPeer(self.MePeerId);
            });
            self.MePeer.on('error', function (err) {
                if (err.type === 'unavailable-id') {
                    self.addLog(err, "Error: ", "danger");
                    self.MePeer.reconnect();
                }
                else{
                    self.addLog(err, "Error: ", "danger");
                }
            });
            
            self.MePeer.on('open', function () {
                self.messageStatus = "En espera de conexión...";
                self.addLog('En espera de conexión...', 'Nodo Open: ', 'secondary');
            });
            self.MePeer.on('connection', function (c) {
                if (self.MeConn) {
                    self.messageStatus = "Ya conectado...";
                    self.addLog('Ya conectado...', 'Nodo Conectado: ', 'secondary');
                    c.send("Ya conectado...");
                    c.close();
                    self.addLog('close...', 'Nodo Conectado: ', 'secondary');
                    return;
                }else{                    
                    self.MeConn = c;
                    self.connect = true;
                    self.messageStatus = "Conectado";
                    self.addLog(self.MePeer.id, 'Nodo Conectado: ', 'secondary');
                    
                    self.MeConn.on('data', function (data) {
                        self.ValidateDataRecibe(data);
                    });
                
                    self.MeConn.on('close', function () {
                        self.connect = false;
                        self.messageStatus = "Connection reset, Awaiting connection...";
                        self.MeConn = null;
                        self.createMyNode();
                    });
                    self.MePeer.on('disconnected', function () {
                        self.connect = false;
                        self.messageStatus = "Connection has been lost.";
                        self.MePeer.reconnect();
                    });
                    self.MePeer.on('error', function (err) {
                        console.log('' + err)
                    });
                    
                    API.Peer.push(self.MeConn);
                }
                
            });
        },
        ValidateDataRecibe(data){
            var self = this;
           
            if(!data.peerId || !data.hash){
                self.addMessage(JSON.stringify(data), 'Mensaje Recibido sin datos completos.', 'danger');                
            }else{
                //if(self.hashHisory.indexOf(data.hash) <= -1){
                    switch (data.type) {
                        case 'message':
                            if(self.bcMessage.indexOf(data.hash) <= -1){
                                if(data.to == self.MePeerId){
                                    self.addMessage(data.text, data.peerId, 'success');
                                    self.addLog(data.from, 'Enviando confirmacion de mensaje a: ', 'info');
                                    self.messageResponse(data);
                                }
                                else if(data.from == self.MePeerId && data.response == true){
                                    if(self.hashHisory.indexOf(data.hash) <= -1){
                                        self.addLog(data.to, 'Mensaje Recibido', 'success');
                                        self.hashHisory.push(data.hash);
                                    }
                                }
                                else{
                                    self.addLog(data.hash, 'Retransamitir Mensaje ', 'secondary');
                                    self.bcMessage[data.hash] = data;
                                }
                            }else{
                                self.addMessage(JSON.stringify(data), 'Recibidio Y Validar encontrado', 'warning');
                            }
                            break;
                        case 'ping':                           
                            if(self.bcPing.indexOf(data.hash) <= -1){
                                if(data.to == self.MePeerId){
                                    self.addLog(data.peerId, 'Recibido por: ', 'success');
                                    self.addLog(data.from, 'Enviando confirmacion a: ', 'info');
                                    self.pingPeerResponse(data);
                                }
                                else if(data.from == self.MePeerId && data.response == true){
                                    if(self.hashHisory.indexOf(data.hash) <= -1){
                                        self.addMessage(data.to, 'Ping', 'success');
                                        self.hashHisory.push(data.hash);
                                    }
                                }
                                else{
                                    self.addLog(data.hash, 'Retransamitir ', 'secondary');
                                    self.bcPing[data.hash] = data;
                                }
                            }else{
                                self.addMessage(JSON.stringify(data), 'Recibidio Y Validar encontrado', 'warning');
                            }
                            break;
                        default:            
                            break;
                    };
                //}
            }
            
        },
        sendMessage(){
            var self = this;
            var send = {};
            send.type = 'message';
            send.text = self.message;
            
            self.addMessage(send.text, 'Enviando: ', 'info');
            self.sendAll(send);
        },
        sendAll(msg){            
            var self = this;            
            var target = API.Peer;
            for (var k in target){
                if (typeof target[k] !== 'function') {
                    if(API.Peer[k].open == true){
                        msg.peerId = self.MePeerId;
                        msg.hash = API.randomHash();
                        API.Peer[k].send(msg);
                        self.addLog(msg.hash, 'Transmitiendo: ', 'secondary');
                        
                        if(msg.type == 'ping'){
                            self.bcPing[msg.hash] = msg;
                        }else if(msg.type == 'message'){
                            self.bcMessage[msg.hash] = msg;
                        }
                        
                    }
                }
            }
            
        },
        validateLoadPeer(r){
            var self = this;
            if(r.error == false){
                if(API.peers.indexOf(r.data.data.peerId) <= -1 && r.data.data.peerId != self.MePeerId){
                    ++self.peersTotal;
                    var peerId = r.data.data.peerId;
                    API.peers.push(peerId);
                    
                    var NewPeer = new Peer();
                    var conn = NewPeer.connect(peerId, {
                        reliable: true
                    });
                    
                    if(Object.keys(API.Nodes).length <= 6 ){
                        var newLoadPeerByHash = setTimeout(function(){
                            self.addLog(r.data.prevhash, 'Cargando Siguiente Peer', "success");
                            self.loadPeerByHash(r.data.prevhash);
                        }, 3000); 
                    }
                    
                    conn.on('open', function () {        
                        var itemNew = {};
                        itemNew.peerId = peerId;
                        itemNew.connect = false;
                        itemNew.data = r.data;
                        API.Nodes[peerId] = itemNew;
                        
                        self.addLog(peerId, 'Conectado con: ', "success");
                        ++self.totalConnect;
                        API.Nodes[peerId].connect = true;
                        
                        conn.on('data', function (data) {
                            console.log("Data recieved");
                            
                            self.ValidateDataRecibe(data);
                        });

                        conn.on('close', function () {
                            --self.totalConnect;
                            self.addLog("Desconectado de: "+peerId, "Coneccion Perdida", "warning");
                            API.Nodes[peerId].connect = false;
                            delete API.Nodes[peerId];
                            delete API.peers[peerId];
                        });
                        
                        NewPeer.on('disconnected', function () {
                            --self.totalConnect;
                            self.addLog("Desconectado:", "Connection has been lost.", "danger");
                            peer.reconnect();
                            API.Nodes[peerId].connect = false;
                            delete API.Nodes[peerId];
                            delete API.peers[peerId];
                        });
                        
                        NewPeer.on('error', function (err) {
                            //alert('' + err)
                            self.addLog(err, "error:", "danger");
                        });

                        command = getUrlParam("command");
                        if (command)
                            conn.send(command);
                        
                        
                        API.Peer.push(conn);
                    });
                }else{
                    if(!MorePeope){
                        var MorePeope = setTimeout(function(){
                            self.loadPeers();
                        }, 5000); 
                    }
                }
            }else{
                self.addLog(r, "Error cargando compañero:", "Danger");
            }
        },
        loadPeerByHash(hash){
            var self = this;
            if(hash == '0000000000000000000000000000000000000000000000000000000000000000'){           
                self.loadPeers();
                return false;
            }
            self.logs.push({
                text: "Cargando mas personas...",
                title: "deMedallo:",
                type: "secondary"
            });
            var arrayPeers = [];
            instance.get('/peer', {
                params: {
                    hash: hash
                }
            })
            .then(function (re) {
                r = re.data;
                self.validateLoadPeer(r);
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        loadPeers(){
            var self = this;
            self.logs.push({
                text: "Cargando Ultima persona conectada...",
                title: "deMedallo: ",
                type: "secondary"
            });
            var arrayPeers = [];
            instance.get('/peer', {
                params: {
                    
                }
            })
            .then(function (re) {
                r = re.data;
                self.validateLoadPeer(r);
            })
            .catch(function (error) {
                console.log(error);
            });
            
        },
        addLog(e, title='Recibido:', type='info'){
            var self = this;
            
            self.lastLog = title + e;
            self.logs.push({
                text: e,
                title: title,
                type: type
            });
            
            /*
            Vue.set(Principal.messages, {
                text: e,
                title: title,
                type: type
            })
            */
        },
        addMessage(e, title='Recibido:', type='info'){
            var self = this;
            
            self.messages.push({
                text: e,
                title: title,
                type: type
            });
            
            /*
            Vue.set(Principal.messages, {
                text: e,
                title: title,
                type: type
            })
            */
        },
        Conectar(){
            var self = this;
            self.addLog("Conectando...", 'deMedallo', 'secondary');
            self.loadPeers();
        }
	},
	beforeCreate:function(){
	},
	template: `<div>
		<header>
			<nav class="navbar navbar-expand-md navbar-dark sticky-top bg-dark">
                <router-link tag="a" class="navbar-brand" to="/">deMedallo</router-link>
				<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
				<div class="collapse navbar-collapse" id="navbarCollapse">
					<form class="navbar-nav mr-auto form-inline" method="search" ><!--  action="javascript:false; " @submit="submitSearch" -->
						<input class="form-control mr-sm-2" type="text" placeholder="¿Que Buscas?" aria-label="¿Que Buscas?" value=""  name="q" v-model="search_text" onfocus="this.value = '';" onblur="if (this.value == '') {this.value = '';}" />
						<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
					</form>
					<ul class="navbar-nav mt-2 mt-md-0">						
						<!-- -->
						<li class="nav-item" v-if="connect == false"><a class="nav-link" href="javascript:false;" @click="Conectar()"><i class="fa fa-sign-in"></i> Conectar</a></li>
						<li class="nav-item" v-if="connect == false"><a class="nav-link"><i class="fa fa-ban"></i> No Conectado</a></li>
						<li class="nav-item" v-if="connect == true"><a class="nav-link"><i class="fa fa-connectdevelop"></i>Conectado</a></li>
						<li class="nav-item"><a class="nav-link"><i class="fa fa-user"></i> {{ MePeerId }}</a></li>
						<li class="nav-item"><a class="nav-link"><i class="fa fa-user"></i> {{ messageStatus }}</a></li>
                        
                        <li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Crear</a>
							<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                <router-link tag="a" class="dropdown-item" to="/createWallet">Billetera</router-link>
							</div>
						</li>
					</ul>
				</div>
			</nav>
		</header>

		<main role="main">
            <div class="content">
                <div class="container">
                    <div class="real row">
                        <div class="col-sm-3">
                            <div class="panel panel-default">
                              <div class="panel-heading">Nodos ( {{ totalConnect }} / {{ peersTotal }} )</div> 
                                <table class="table table-responsive">
                                    <tr v-for="node in nodes" :key="node.peerId">
                                        <td>
                                            <div class="led-green" v-if="node.connect == true"></div>
                                            <div class="led-gray" v-if="node.connect == false"></div>
                                        </td>
                                        <td>{{ node.peerId }}</td>
                                        <td><a href="#" class="btn btn-sm btn-secondary" @click="pingPeer(node.peerId)">Ping</a></td>
                                        <td><a href="#" class="btn btn-sm btn-success" @click="messagePeer(node.peerId)">Enviar texto</a></td>
                                        <!-- {{ node.data.timestamp }} -->
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <div class="col-sm-9">
                            <transition>
                                <keep-alive>
                                    <router-view></router-view>
                                </keep-alive>
                            </transition>
                        </div>
                        <div class="col-sm-12">
                            <span>{{ lastLog }}</span>
                        </div>
                        <div class="col-sm-12 pre-scrollable" style="max-height: calc(25vh);min-height: calc(25vh);">
                            <table class="table table-responsive_">
                                <tbody class="">
                                    <tr v-for="log in logs">
                                        <td>
                                            <div v-bind:class="'alert alert-' + log.type " >
                                              <strong>{{ log.title }}</strong> {{ log.text }}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
		</main>
	</div>`
});