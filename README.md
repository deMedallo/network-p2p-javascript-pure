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
# Resultado = 0x8c16163f7276983e49258035051383ee
address = '0x' + md5(Hex($mail) + ':' + sha256(sha256(Hex(password))));

# Resultado = 52910184bd3b14358d978b5e14ad5375a423896997bf67aa2e1e142d4b0fb9c816992c8564d05ddf3ddb15593cfc6fd1
privatekey = sha384(Hex($pass) + ':' + sha256(Hex($mail)));

# Resultado = 3730363537323733366636653631366334643631363936633a333533323339333133303331333833343632363433333632333133343333333533383634333933373338363233353635333133343631363433353333333733353631333433323333333833393336333933393337363236363336333736313631333236353331363533313334333236343334363233303636363233393633333833313336333933393332363333383335333633343634333033353634363436363333363436343632333133353335333933333633363636333336363636343331
publickey = Hex(Hex($mail) + ':' + Hex($privatekey));
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
