var csrf    = $('meta[name="csrf"]').attr('content');
var path    = "XEM";
var ajaxUrl = location.protocol + "//" + location.host + "/website/api/";
var httpUrl = location.protocol + "//" + location.host + "/website/";

var audio_load = document.getElementById("load");
var audio_coin = document.getElementById("coin");
var audio_error = document.getElementById('error');
var audio_save = document.getElementById('saved');

$(document).ready(function() {
    ADSController.start();
    $('[data-toggle="tooltip"]').tooltip();
    audio_load.play();
	$.cookie("USER_AMOUNT_" + path, 0);
	
	document.addEventListener ? document.addEventListener("contextmenu", function(t) { 
		t.preventDefault()
	}, !1) : document.attachEvent("oncontextmenu", function() {
		window.event.returnValue = !1
	}), document.onkeydown = function(t) {
		if (122 != t.keyCode) return !1
	}, document.addEventListener ? document.addEventListener("contextmenu", function(t) {
		t.preventDefault()
	}, !1) : document.attachEvent("oncontextmenu", function() {
		window.event.returnValue = !1
	}), document.onkeydown = function(t) {
		if (122 != t.keyCode) return !1
	};
	
    _BalanceLoad();
});

var load = setInterval(function() {
    if (width >= 100) {		
        $(".loading").fadeOut('fast');
        clearInterval(load);
		setInterval(function(){ _MinerStart(); }, 4000);
		setInterval(function(){ _updateBalance(); }, 25000);
    } else {
        width++;
        $("#loading").width(width + "%")
    }
}, 50);

function _BalanceLoad(){
    var wallet = JSON.parse(localStorage.wallets);
    wallet = JSON.parse(localStorage.wallets);
    if(wallet.DM.address && wallet.DM.coin_id){
        $("#amount").text((parseFloat(wallet.DM.balance)).toFixed(8));
        //_TerminalUpdate();
    }
}

function _TerminalSound() {
    console.log('_TerminalSound');
    if ($("#coin").prop('muted')) {
        $("#mute").text('volume_up');
        $("audio").prop('muted', false);
    } else {
        $("#mute").text('volume_off');
        $("audio").prop('muted', true);
    }
}

function _ServerTime(type) {
    //console.log('_ServerTime');
    var t = new Date,
        e = t.getDate(),
        n = t.getMonth() + 1,
        o = t.getFullYear();
    e = (e < 10 ? "0" : "") + e;
    var a = o + "-" + (n = (n < 10 ? "0" : "") + n) + "-" + e,
        r = t.getHours(),
        i = t.getMinutes(),
        c = t.getSeconds();
    if (type == "date") {
        return a;
    } else {
        return "[" + a + " " + ((r = (r < 10 ? "0" : "") + r) + ":" + (i = (i < 10 ? "0" : "") + i) + ":" + (c = (c < 10 ? "0" : "") + c)) + "]";
    }
}

function _RandMining() {
    //console.log('_RandMining');
    for (var t = "", e = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", n = 0; n < 30; n++) t += e.charAt(Math.floor(Math.random() * e.length));
    var res1 = t.substr(1, 2);
    var res2 = t.substr(4, 2);
    var res3 = t.substr(8, 2);
    var res4 = t.substr(12, 2);
    var res5 = t.substr(16, 2);
    var res6 = t.substr(18, 2);
    var res7 = t.substr(20, 2);
    var res8 = t.substr(22, 2);
    return "=> " + res1 + " " + res2 + " " + res3 + " " + res4;

}

function _MinerStart() {
    $("i#save").hide();
    //console.log('_MinerStart');
	if(!stop){
		if (rows > 8) {
			($("#logs").empty(), rows = 0);
		}
		rows++
		audio_coin.play();
		$("#logs").append('<li><span>' + _ServerTime() + '<i class="material-icons minicon">&#xE5CA;</i> ' + _RandMining() + '</span></li>');
	}
}

function _updateBalance(){
    $.ajax({
        type: "GET",
        url: ajaxUrl + "/points",
        dataType: "json",
        data: {
            token: localStorage.token
        },
        success: function(t) {
            console.log(t);
            if(t.data && t.data.error == false){
                $("#amount").text((parseFloat(t.data.balance_to)).toFixed(8));
                clockController(25);
            }else{
                console.log(t);
                audio_error.play();
                stop = 1;
                document.title = 'Error!';
                $(".terminal-content").html('<div class="error"><i class="material-icons">error</i><br />' + t.msg + '<br>' + t.msg + '</div>').hide().fadeIn(1000);
                setTimeout(function(){
                    $(".terminal-content").html('<div class="error"><i class="material-icons">error</i><br />' + t.msg + '<br>' + t.msg + '</div>').hide().fadeOut(1000);
                }, 3000);
            }
        },
        error: function(e){
            clockController(25);
        }
    });
}

function _TerminalUpdate() {
    console.log('_TerminalUpdate');
    audio_save.play();
    $("i#save").hide();
    if(ADSController.isRunning() == true){
        _updateBalance();
    }else{
        $(".terminal-content").html('<div class="error"><i class="material-icons">error</i><br />ERROR: <br>Problemas conectando con la API de minería.</div>').hide().fadeIn(1000);
        $(".terminal-content").html('<div class="error"><i class="material-icons">error</i><br />ERROR: <br>Problemas conectando con la API de minería.</div>').hide().fadeOut(1000);
    }
}


function clockController(time){
    console.log('clockController');
	$("i#save").hide();
	$('#terminal_time').show();					
		$.sayimiBaslat = function(){
				if(time > 1){
						time--;
						$(".time_ajax").text(time);
				} else {
                    
                    //$('#terminal_time').hide();
				$("i#save").show();
				clearInterval(tx);
			}
		}
	$(".time_ajax").text(time);
	var tx = setInterval("$.sayimiBaslat()", 1000);		
}