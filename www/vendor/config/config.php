<?php
include(__DIR__.'/models/global.php');
include(__DIR__.'/models/keccak.php');


# ---------------------------------
define('TotalEra', 250);
define('BlocksForEra', 100000);
#define('RewardForBlockInitial', 5000000000000000000);
define('RewardForBlockInitial', 50);
#ini_set('memory_limit', '512M');

# ---------------------------------
error_reporting(-1);
ini_set('display_errors', 'on');
#setlocale(LC_TIME,"es_CO"); // Configurar Hora para Colombia
#setlocale(LC_TIME, 'es_CO.UTF-8'); // Configurar Hora para Colombia en UTF-8
#date_default_timezone_set('America/Bogota'); // Configurar Zona Horaria
define('site_name', 'deMedallo - BlockChain PHP'); // Titulo X defecto de la aplicacion
define('site_name_md', 'DM BlockChain'); // Titulo X defecto small
define('folderSitio', '/bc'); // Ruta de la carpeta del Sitio
define("SERVER_NAME", $_SERVER['SERVER_NAME']); // Definir nombre del servidor
define("SERVER_HOST", $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['SERVER_NAME']); // Definir nombre del servidor con host -> ORGANIZAR -> $_SERVER['REQUEST_SCHEME'].
define('url_site', SERVER_HOST.folderSitio); // Definir url del aplicativo/sitio
define('site_author_name', 'FelipheGomez'); // Nombre del desarrollador del Sitio
define('site_author_url', 'wWw.FelipheGomez.Info'); // URL del creador del Sitio

define('folder_blockchain', __DIR__.'/../../data'); // URL del creador del Sitio


session_set_cookie_params(0, url_site);
session_start(['cookie_lifetime' => 86400,'read_and_close'  => false,]); // 86400 -> 1 Dia /// Tiempo de expiracion de la sesion en el servidor // Lectura y Cierre de la sessio e servidor 
header('Access-Control-Allow-Origin: *'); // Control de acceso Permitir origen de:
# ---------------------------------
function RunAPI(){
	$api = new apiBC();
	if(file_exists($api->pageFile)){
		include($api->pageFile);
	}else{
		#echo "Error 404: {$api->pageFile}";
		# include('config/docs/site/errors/404.php');
	}
}

function actionDetect(){
	$r = 'view';
	switch ($_SERVER["REQUEST_METHOD"]) {
	  case 'GET':
		$r = 'view';
		break;
	  case 'PUT':
		$r = 'update';
		break;
	  case 'POST':
		$r = 'create';
		break;
	  case 'DELETE':
		$r = 'delete';
		break;
	  default:
		$r = 'view';
		break;
	}
	return $r;
}
function retrievePostData() {
    if ($_FILES) {
        $files = array();
        foreach ($_FILES as $name => $file) {
            foreach ($file as $key => $value) {
                switch ($key) {
                    case 'tmp_name': $files[$name] = $value?base64_encode(file_get_contents($value)):''; break;
                    default: $files[$name.'_'.$key] = $value;
                }
            }
        }
        return (json_decode(http_build_query(array_merge($files,$_POST))));
    }
    return json_decode(file_get_contents('php://input'));
}

function dataPage(){
	$method = $_SERVER["REQUEST_METHOD"];
	$datos = null;
	switch ($method) {
	  case 'GET':
		$datos = $_GET;
		break;
	  case 'PUT':
		$datos = $_PUT;
		break;
	  case 'POST':
		$datos = retrievePostData();
		break;
	  case 'DELETE':
		$datos = $_DELETE;
		break;
	  default:
		break;
	}
	
	$datos = json_decode(json_encode($datos));
	return $datos;
}

function pageActive(){
	$r = 'index';
	$data = dataPage();
	if(isset($data->page)){ $r = "{$data->page}"; }
	else{ $r = 'index'; }
    if(isset($_GET['page'])){
        $r = $_GET['page'];
    }
	return $r;
}

function pageFile(){
	$r = 'index';
	$page = pageActive();
	$action = actionDetect();	
	$r = __DIR__."/templates/{$page}/{$action}.php";
	return $r;
}

function ValidateData($miner){
    $r = new stdClass();
    
    return json_encode($r);
}

function ValidateMiner($miner){
    return ($miner);
}

# String2Hex("test sentence...");
function String2Hex($string){
    $hex='';
    for ($i=0; $i < strlen($string); $i++){
        $hex .= dechex(ord($string[$i]));
    }
    return $hex;
}
 
# Hex2String(String2Hex("test sentence..."));
function Hex2String($hex){
    $string='';
    for ($i=0; $i < strlen($hex)-1; $i+=2){
        $string .= chr(hexdec($hex[$i].$hex[$i+1]));
    }
    return $string;
}

function calcReward($blockEra, $blockNumberEra){
    if($blockNumberEra <= 0){
        $blockEra = 1;
        $blockNumberEra = 0;
    }
    
    if($blockNumberEra >= BlocksForEra){
        $blockNumberEra = 0;
        $blockEra++;
    }
    
    #50(9/250)^250
    $formula = 0;
    $Reward = 0;
    if($blockEra > TotalEra){
        $Reward = 0;
    }else{
            $TotalEra = TotalEra;
            $Exponential = $blockNumberEra;
            if($blockNumberEra == 0 && $blockEra == 1){
                $blockRest = TotalEra;
            }
            else{
                $blockRest = ($TotalEra - $blockEra);
            }
            
            $rewa = RewardForBlockInitial;
            $NumberBE = $blockNumberEra;
            
            $formula = "$rewa * ( $blockRest / $TotalEra ) ** $Exponential";
            $Reward = $rewa * ( $blockRest / $TotalEra ) ** $Exponential;
    }
    return $Reward;
}