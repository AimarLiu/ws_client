# Description

ws_client is a wrapper for the popular Web Socket module (ws), which provides an communication to get  data of nexulab's gateway. Below is our architecture based on Web Socket.

![nexulab_websocket](nexulab_websocket_2.png)

# Requirements

- Most of web browser like chrome, IE, Apple's Safari.. etc, should be supporting the W3C's websocket as default.

# Installation  

- suppose to use javascript.

  To use CDN:

  To crate an instance of the wrapper use the following code:
  
  ```
  <script src="./ws_client.js"></script>
  ```

# Usage

### Initialization

To crate an instance of the wrapper use the following code:

```
var wsClient = new WebSocketClient("hello@user.com"); 
```

### Connecting

After creating the new object you may want to connect to the server by using the `open` method:

```
wsClient.onGatewayData = this.gatewayData.bind(/* binding 'this' on your specific scope */);
gatewayData: function (msg) {
	// something to do
}
wsClient.open();
```

And overwrite the .onGatewayData(msg) method which should be executed when the data is received. The 'msg' is .Parameters.Obj with a json format as follwing:

```
/*
Below json format is our special packet format between server and client through websocket.
*/
{
  "//_comment1": "Type is Command, Data, or Ack",
  "Type": "Data",
  "//_comment2": "return 0: OK, -1: fail",
  "Status": 0,
  "Timestamp": "<UTC time>",
  "Paramters":
  {
    "Cmd": "",
    "//_comment3": "Obj is a gateway data, you should use the data to update something",
    "Obj":
      {
      },
    "Reserved": ""
  }
}
```

# Examples

In this example is how to use 'live' for button trigger

```
var wsClient = new WebSocketClient('user1@nexulab.com');
wsClient.open();
// Explicit binding 'this' as something object
wsClient.onGatewayData = this.gatewayData.bind(/*something obejct*/);
// Use the received data to update something you want
gatewayData = function(obj) {
	if (Object.keys(obj).length != 0 && obj.constructor === Object) {
            
    }
};
```

# TODO

- 