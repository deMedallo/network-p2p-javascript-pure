# blockchain-php
Nueva blockchain basada en PHP (BETA)

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
