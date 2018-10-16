# Blockchain-JS Peer To Peer Javascript / P2P JS
Nueva Red P2P (Peer To Peer) basada en JavaScript (BETA) compatible con cualquier dispositivo con navegador Web.

## DEMO
http://demedallo.com/bc/

## Atributos Consola
Algunos atributos compatibles con la consola Web.

| Comando | Descripcion | Atributo | Modo de uso |
|:---------:|-------------|----------|-------------|
| **ping** | Enviar ping a un nodo. | * **nodeId** Id del nodo de destino.|  ping ``{nodeId}`` |
| **sendMessage** | Enviar texto o mensaje a un nodo. | * **nodeId** Id del nodo de destino. * **text** Texto a enviar. |  sendMessage ``{nodeId}`` ``{text}`` |
| **listPeer** | Obtener listado de los nodos conectados (Se muestra en json si esta habilitado). | * **infoComplete** Informacion completa true/false.|  listPeer ``{infoComplete}`` |
| **addPeer** | Agregar un nodo nuevo. | * **nodeId** Id del nodo para agregar.|  addPeer ``{nodeId}`` |
