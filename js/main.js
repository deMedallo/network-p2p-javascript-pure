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
    mounted(){
		var self = this;
    },
	template: `
        <div>
            <div class="col-sm-12 pre-scrollable" style="max-height: calc(50vh);min-height: calc(50vh);">
                <div v-for="msg in $parent.messagesAPI">
                    <div v-bind:class="'alert alert-' + msg.type" >
                      <strong>{{ msg.from }} => {{ msg.to }}</strong> {{ msg.text }}
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
        'API': API,
        'homePage': homePage
	},
	data: {
		connect: false,
		nodoCreate: false,
		statusAPI: '',
		messagesAPI: [],
		logsAPI: [],
		MePeerId: '',
		hashHisory: [],
		bcPing: [],
		bcMessage: [],
		nodesStatus: {},
		nodesEnables: {},
		totalConnect: 0,
        peersTotal: 0,
		messages: [],
		message: '',
		lastLog: '',
		logs: [],
		peers: [],
		search_node: '',
		MeConn: null,
		messageStatus: '',
		MePeer: null,
		lastPing: null,
	},
	created() {
		var self = this;
	},
	mounted() {
		var self = this;
        self.createMyNode();
        
        self.startInterval();
	},
	methods: {
        startInterval() {
            const self = this;
            setInterval(function() {
                self.nodesStatus = API.getNodesStatus();
                self.nodesEnables = API.nodesEnables();
                self.messagesAPI = API.getMessages();
                self.logsAPI = API.getLogs();
                self.statusAPI = API.getStatus();
            }, 1000);
            setInterval(function() {
                self.MePeerId = API.peerId;
                self.connect = API.connectStatus;
                
                self.lastPing = new Date();
            }, 5000);
        },
        nodeSearch(){
            var self = this;
            if(self.search_node != '' && self.search_node.length > 4)
            {
                if(self.MePeerId != self.search_node){
                    self.createNode(self.search_node);
                }else{
                    alert('No te puedes conectar a tu nodo');
                }
            }
        },
        pingPeer(peerId){
            API.sendPing(peerId);
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
            self.nodoCreate = true;
            API.createMyNode();
            
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
        createNode(peerId){
            API.createConnection(peerId);
        },
        addLog(e, title='Recibido:', type='info'){
            var self = this;
            
            self.lastLog = title + e;
            self.logs.push({
                text: e,
                title: title,
                type: type
            });
            
        },
        addMessage(e, title='Recibido:', type='info'){
            var self = this;
            
            self.messages.push({
                text: e,
                title: title,
                type: type
            });
            
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
					<form class="navbar-nav mr-auto form-inline" method="search" action="javascript:false; " @submit="nodeSearch">
						<input class="form-control mr-sm-2" type="text" placeholder="Agregar nodo" aria-label="¿Que Buscas?" value=""  name="q" v-model="search_node" onfocus="this.value = '';" onblur="if (this.value == '') {this.value = '';}" />
						<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Agregar</button>
					</form>
					<ul class="navbar-nav mt-2 mt-md-0">						
						<!-- -->
                        <router-link tag="li" class="nav-item" to="/createWallet">Billetera</router-link>
						<li class="nav-item" v-if="nodoCreate == false"><a class="nav-link" href="javascript:false;" @click="createMyNode()"><i class="fa fa-sign-in"></i> Crear Nodo</a></li>
						<li class="nav-item" v-if="connect == false"><a class="nav-link"><i class="fa fa-connectdevelop"></i>No Conectado</a></li>
						<li class="nav-item" v-if="connect == true"><a class="nav-link"><i class="fa fa-connectdevelop"></i>Conectado</a></li>
						<li class="nav-item"><a class="nav-link" if="nodoCreate == true"><i class="fa fa-user"></i> {{ MePeerId }}</a></li>
						<li class="nav-item"><a class="nav-link" if="nodoCreate == true"><i class="fa fa-user"></i> {{ statusAPI }}</a></li>
                        
                        
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
                        <div class="col-sm-4">
                            <div class="panel panel-default">
                              <div class="panel-heading">Nodos ( {{ totalConnect }} / {{ peersTotal }} )</div> 
                                <table class="table table-responsive">
                                    <tr v-for="node in nodesStatus" :key="node.peerId" v-if="node.peerId != MePeerId">
                                        <td>
                                            <div class="led-green" v-if="node.connect == 1"></div>
                                            <div class="led-gray" v-else-if="node.connect == 0"></div>
                                            <div class="led-orange" v-else-if="node.connect == 2"></div>
                                        </td>
                                        <td>{{ node.peerId }}</td>
                                        <td><a href="#" class="btn btn-sm btn-secondary" @click="pingPeer(node.peerId)">Ping</a></td>
                                        <td><a href="#" class="btn btn-sm btn-success" @click="messagePeer(node.peerId)">Enviar texto</a></td>
                                        <!-- {{ node.data.timestamp }} -->
                                    </tr>
                                </table>
                            </div>
                            
                            
                            <div class="panel panel-default">
                              <div class="panel-heading">Encontrados</div> 
                                <table class="table table-responsive">
                                    <tr v-for="node in nodesEnables" :key="node.peerId" v-if="node.peerId != MePeerId">
                                        <td>{{ node.peerId }}</td>
                                        <td><a href="#" class="btn btn-sm btn-secondary" @click="createNode(node.peerId)">Conectar</a></td>
                                        <td><a href="#" class="btn btn-sm btn-secondary" @click="pingPeer(node.peerId)">Ping</a></td>
                                        <!-- {{ node.data.timestamp }} -->
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <div class="col-sm-8">
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
                                    <tr v-for="log in logsAPI">
                                        <td>
                                            <div v-bind:class="'alert alert-secondary'" >
                                              <strong>{{ log.timestamp }}</strong> {{ log.text }}
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