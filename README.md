# blockchain-php
Nueva blockchain basada en PHP (BETA)

## Creacion de Billetera / Carteras
las billeretas se basan en una dirección de correo electronico y una contraseña.

### Campos
~~~json
GET
    ./bc/generateWallet/?hash=personalPassword&mail=personalMail
~~~

### Resultado
~~~php
$address = '0x'.md5(Hex($mail).':'.hash('sha256', hash('sha256', Hex($pass))));
# Resultado: 0x8c16163f7276983e49258035051383ee

$privatekey = hash('sha384', Hex($pass).':'.Hex($address));
# Resultado: c77bec2b8b852b1897e24963193b3238d1523ae003b16893828a23173b27f2ab62498d12cf2aff364e4a6fcf200da0e0

$publickey = Hex($mail.':'.$address.":".Hex($privatekey));
# Resultado: 706572736f6e616c4d61696c3a307838633136313633663732373639383365343932353830333530353133383365653a363333373337363236353633333236323338363233383335333236323331333833393337363533323334333933363333333133393333363233333332333333383634333133353332333336313635333033303333363233313336333833393333333833323338363133323333333133373333363233323337363633323631363233363332333433393338363433313332363336363332363136363636333333363334363533343631333636363633363633323330333036343631333036353330
~~~

## Documentacion API
### Bloques

#### Visualizar Todos los bloques
Utilice ``GET /bc/blocks`` para visualizar todos los bloques.
~~~curl
GET 
    ./bc/blocks
~~~

#### Visualizar bloque por Hash
Utilice ``GET /bc/blocks`` con parametro ``hash`` para visualizar el bloque.
~~~curl
GET 
    ./bc/blocks?hash=390eb2158128cb0e7605f793671a72767d75a61426d21dcf073b9696b8abf70e
~~~

#### Visualizar bloque por Hash Anterior
Utilice ``GET /bc/blocks`` con parametro ``hash`` para visualizar el bloque.
~~~curl
GET 
    ./bc/blocks?prevhash=0000000000000000000000000000000000000000000000000000000000000000
~~~
