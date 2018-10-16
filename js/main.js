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
            <div class="col-sm-12 pre-scrollable bg-console" style="max-height: calc(75vh);min-height: calc(75vh);overflow: auto;">
                <div v-for="msg in $parent.messagesAPI">
                    <div v-bind:class="'alert alert-' + msg.type" >
                      <strong>[ {{ msg.timestamp }} ] </strong> 
                      <strong>{{ msg.from }} => {{ msg.to }} : <i v-bind:class="msg.icon"></i></strong> {{ msg.text }}
                    </div>
                </div>
            </div>
            <div class="form-control-console bg-console" style="padding: 0;">
                    <textarea class="form-control-console" v-model="$parent.message"></textarea>
            </div>
            <!-- <button @click="SendMessage" class=\"btn btn-info\">Enviar</button> -->
            <hr>
            <br>
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
		myMessages: {
            "ul": {
                as: 'as'
            }
        },
		messagesAPI: [],
		logsAPI: [],
		MePeerId: 'Default',
		hashHisory: [],
		bcPing: [],
		bcMessage: [],
		nodesStatus: {},
		nodesEnables: {},
		totalConnect: 0,
        peersTotal: API.Peer.length,
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
                self.myMessages = API.getMyMessages();
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
            API.sendMessage({
                to: peerId,
                text: self.message
            });
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
        },
        clearMessages(){
            API.clearMessages();
        },
        clearLogs(){
            API.clearLogs();
        }
	},
	beforeCreate:function(){
	},
	template: `<div>
		<header>
			<nav class="navbar navbar-expand-md navbar-dark sticky-top bg-secondary">
                <router-link tag="a" class="navbar-brand" to="/">deMedallo</router-link>
				<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
				<div class="collapse navbar-collapse" id="navbarCollapse">
					<form class="navbar-nav mr-auto form-inline" method="search" action="javascript:false; " @submit="nodeSearch">
						<input class="form-control mr-sm-2" type="text" placeholder="Agregar nodo" aria-label="¿Que Buscas?" value=""  name="q" v-model="search_node" onfocus="this.value = '';" onblur="if (this.value == '') {this.value = '';}" />
						<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Agregar</button>
					</form>
					<ul class="navbar-nav mt-2 mt-md-0">
						<li class="nav-item"><router-link tag="a" class="nav-link" to="/"><i class="fa fa-code"></i> Consola</router-link></li>
                        
						<li class="nav-item" v-if="nodoCreate == false"><a class="nav-link" href="javascript:false;" @click="createMyNode()"><i class="fa fa-sign-in"></i> Crear Nodo</a></li>
						
                        
						<li class="nav-item"><a class="nav-link" if="nodoCreate == true">{{ statusAPI }}</a></li>
						<li class="nav-item" v-if="connect == 0"><a class="nav-link"><div class="led-gray"></div></a></li>
						<li class="nav-item" v-if="connect == 1"><a class="nav-link"><div class="led-green"></div></a></li>
						<li class="nav-item" v-if="connect == 2"><a class="nav-link"><div class="led-orange"></div></a></li>
                        
						<li class="nav-item"><a class="nav-link"><i class="fa fa-user"></i> {{ MePeerId }}</a></li>
                        
                        <li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-ellipsis-v"></i>
                            </a>
							<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                <a class="dropdown-item" @click="clearLogs"><i class="fa fa-eraser"></i> Limpiar Logs</a>
                                <a class="dropdown-item" @click="clearMessages"><i class="fa fa-eraser"></i> Limpiar Consola</a>
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
                              <div class="panel-heading">Nodos ( {{ peersTotal }} )</div> 
                              <div class="panel-body">
                                <table class="table table-responsive">
                                    <tr v-for="node in nodesStatus" :key="node.peerId" v-if="node.peerId != MePeerId">
                                        <td>
                                            <div class="led-green" v-if="node.connect == 1"></div>
                                            <div class="led-gray" v-else-if="node.connect == 0"></div>
                                            <div class="led-orange" v-else-if="node.connect == 2"></div>
                                        </td>
                                        <td>{{ node.peerId }}</td>
                                        <td><a href="#" class="btn btn-sm btn-secondary" @click="pingPeer(node.peerId)"><i class="fa fa-check"></i></a></td>
                                        <td><a href="#" class="btn btn-sm btn-success" @click="messagePeer(node.peerId)"><i class="fa fa-font"></i></a></td>
                                        <!-- {{ node.data.timestamp }} -->
                                    </tr>
                                </table>
                                <hr>
                              </div> 
                            </div>
                            
                            <div class="panel panel-default">
                              <div class="panel-heading">Más Nodos Encontrados</div> 
                              <div class="panel-body">
                                <table class="table table-responsive">
                                    <tr v-for="node in nodesEnables" :key="node.peerId" v-if="node.peerId != MePeerId">
                                        <td>{{ node.peerId }}</td>
                                        <td><a href="#" class="btn btn-sm btn-info" @click="createNode(node.peerId)"><i class="fa fa-link"></i></a></td>
                                        <td><a href="#" class="btn btn-sm btn-secondary" @click="pingPeer(node.peerId)"><i class="fa fa-check"></i></a></td>
                                        <td><a href="#" class="btn btn-sm btn-success" @click="messagePeer(node.peerId)"><i class="fa fa-font"></i></a></td>
                                    </tr>
                                </table>
                              </div>
                              <hr>
                            </div>
                            
                            <div class="col-sm-12 pre-scrollable" style="max-height: calc(35vh);min-height: calc(35vh);overflow:auto;background-color:transparent;">
                                <h3>Mensajes</h3>
                                <div v-for="(msg, key, index) in myMessages" :key="key">
                                    <div v-bind:class="'alert alert-secondary'" >

                                        <strong v-if="msg.from == MePeerId">My  => {{ msg.to }}</strong>
                                        <strong v-if="msg.to == MePeerId">{{ msg.from }}  => My</strong> 
                                        <p>{{ msg.text }}</p>
                                    </div>
                                </div>
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
                        <div class="col-sm-12 pre-scrollable" style="max-height: calc(25vh);min-height: calc(25vh);overflow:auto;">
                            <div class="panel panel-default">
                                <div class="panel-body bg-console">
                                    <div v-for="log in logsAPI">
                                        <div v-bind:class="'alert alert-secondary'" >
                                          <strong>{{ log.timestamp }} <i v-bind:class="log.icon"></i></strong> {{ log.text }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		</main>
	</div>`
});