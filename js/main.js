
const homePage = Vue.component('homePage', {
	data: function () {
		return {
			error: false,
			peers: []
		}
	},
	template: `<div class="content">
			<div class="container">
                <div class="real row">
                    <div class="col-sm-3">
                        <div v-for="node in $parent.nodes">
                            <div v-bind:class="'alert alert-secondary'" >
                              <ul>
                                <li>ID: {{ node.data.peerId }}</li>
                                <!-- <li>{{ node.prevhash }}</li>
                                <li>{{ node.hash }}</li> -->
                              </ul>
                            </div>
                        </div>                        
                    </div>
                    <div class="col-sm-7">
                        <div v-for="msg in $parent.messages">
                            <div v-bind:class="'alert alert-' + msg.type " >
                              <strong>{{ msg.title }}</strong> {{ msg.text }}
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-2">
                        <button @click="SendAll()" class=\"btn btn-info\">Go!</button>
                    </div>
                </div>
                
				<div class="row">
					<div class="col-sm-12 row-fluid">
                        <div class="col-sm-3">
                            Payout: 1.83124455 WEB per 1M hashes
                        </div>
                        <div class="col-sm-3">
                            Difficulty: 0.026G
                        </div>
                        <div class="col-sm-3">
                            Orphan blocks: 2%
                        </div>
                        <div class="col-sm-3">
                            Block reward: 48.229 WEB
                        </div>
                        <div class="col-sm-3">
                            Payout: 100%
                        </div>
					</div>
				</div>
			</div>
		</div>
	`,
	methods: {
        SendAll(){
            var self = this;
            self.$parent.addMessage('Go');
            API.SendAll('Go');
        }
	},
	created(){
		var self = this;
	},
	mounted(){
		var self = this;
        
	}
});

const routes = [
	{ path: '/', name: 'viewHomePage', component: homePage },
];

const router = new VueRouter({
  routes
})

var Principal = new Vue({
	el: '#app',
	router: router,
	components: {
	},
	data: {
		connect: false,
		messages: [],
		peers: [],
		search_text: '',
		nodes: API.Nodes,
	},
	created() {
		var self = this;
	},
	mounted() {
	},
	watch: {
		//token(newName) { localStorage.token = newName; }
	},
	methods: {
        sendAll(e){
            
        },
        loadPeers(){
            console.log('Cargando peers mensaje');
            var self = this;
            
            self.messages.push({
                text: "Cargando Ultima persona conectada...",
                title: "DM:",
                type: "secondary"
            });
            var arrayPeers = [];
            instance.get('/peer', {
                params: {
                    
                }
            })
            .then(function (re) {
                r = re.data;
                if(r.error == false){
                    console.log(r.data.data.peerId);
                    self.addMessage(r.data.data.peerId, "Nuevo Compañero:", "info");
                    API.Nodes.push(r.data);
                    API.peers.push(r.data.data.peerId);
                    peerId = r.data.data.peerId;
                    
                    var NewPeer = new Peer();
                    var conn = NewPeer.connect(r.data.data.peerId, {
                        reliable: true
                    });
                    
                    conn.on('open', function(){
                        conn.send('Go');
                        self.addMessage('Go', "Conectado:", "Success");
                    });
                     
                    conn.on('open', function (id) {
                        console.log(peerId);
                        self.addMessage(peerId, "Connected to: ", "Success");
                        conn.on('data', function (data) {
                            self.addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
                            //addMessage("<span class=\"peerMsg\">" + peerId + "</span> " + data);
                        });

                        conn.on('close', function () {
                            self.addMessage("Desconectado", "Connection closed", "error");
                        });
                        
                        NewPeer.on('disconnected', function () {
                            alert();
                            self.addMessage("Desconectado:", "Connection has been lost.", "error");
                            peer.reconnect();
                        });
                        
                        NewPeer.on('error', function (err) {
                            //alert('' + err)
                            self.addMessage(err, "error:", "error");
                        });

                        command = getUrlParam("command");
                        if (command)
                            conn.send(command);

                            var cueString = "<span class=\"cueMsg\">T: </span>";
                        /*
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

                        sendMessageBox.onkeypress = function (e) {
                            var event = e || window.event;
                            var char = event.which || event.keyCode;
                            if (char == '13')
                                sendButton.click();
                        };
                        
                        sendButton.onclick = function () {
                            msg = sendMessageBox.value;
                            sendMessageBox.value = "";
                            conn.send(msg);
                            console.log("Sent: " + msg)
                            addMessage("<span class=\"selfMsg\">Self: </span> " + msg);
                        };
                        
                        clearMsgsButton.onclick = function () {
                            clearMessages();
                        };
                        */

                        conn.send("Go");
                        self.addMessage("Go");
                    });
                    API.Peer.push(conn);
                }else{
                    self.addMessage(r, "Error cargando compañero:", "Danger");
                }
                
            })
            .catch(function (error) {
                console.log(error);
            });
            
            /*
            
            var myPeer = new Peer();
            var conn = myPeer.connect('8d8djyu79vl00000');
            conn.on('open', function(){
              conn.send('hi!');
            });
            */
        },
        addMessage(e, title='Recibido:', type='info'){
            console.log('agregando mensaje');
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
            console.log('Conectando');
            var self = this;
            self.addMessage("Conectando...");
            self.loadPeers();
        }
	},
	beforeCreate:function(){
	},
	template: `<div>
		<header>
			<nav class="navbar navbar-expand-md navbar-dark sticky-top bg-dark">
				<a class="navbar-brand" href="#">DM</a>
				<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
				<div class="collapse navbar-collapse" id="navbarCollapse">
					<form class="navbar-nav mr-auto form-inline" method="search" ><!--  action="javascript:false; " @submit="submitSearch" -->
						<input class="form-control mr-sm-2" type="text" placeholder="¿Que Buscas?" aria-label="¿Que Buscas?" value=""  name="q" v-model="search_text" onfocus="this.value = '';" onblur="if (this.value == '') {this.value = '';}" />
						<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
					</form>
					<ul class="navbar-nav mt-2 mt-md-0">						
						<!-- <li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Ingresar</a>
							<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
																
							</div>
						</li>-->
						<li class="nav-item" v-if="connect == false"><a class="nav-link" href="javascript:false;" @click="Conectar()"><i class="fa fa-sign-in"></i> Conectar</a></li>
						<li class="nav-item" v-if="connect == false"><a class="nav-link"><i class="fa fa-ban"></i> No Conectado</a></li>
						<li class="nav-item" v-if="connect == true"><a class="nav-link"><i class="fa fa-connectdevelop"></i>Conectado</a></li>
					</ul>
				</div>
			</nav>
		</header>

		<main role="main">
			<transition>
			  <keep-alive>
				<router-view></router-view>
			  </keep-alive>
			</transition>
			<Footer></Footer>
		</main>
	</div>`
});