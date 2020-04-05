
function WebSocketClient(webname) {
	this.number = 0;	// Message number
	this.autoReconnectInterval = 15*1000;	// ms
	this.webName = webname;
	this.timeout;
	this.connected = false;
	// Receied and send are use the same package format
	this.package = { 
		// Type: Command, Data, or Ack
  		Type: "Command",
  		// return 0: OK, -1: Fail
  		Status: 0,
  		Timestamp: null,
  		Parameters:
  		{
    		//Who_Am_I, Live_Data, Current_Data ... and so on",
    		Cmd: "Normal",
    		// data will store command or data info depend on customised definition.",
    		Obj: null,
    		Reserved: null,
  		}
	};
}
// Methods onopen, onmessage, onclose, and onerror can be overloaded
WebSocketClient.prototype.open = function() {
	if ("WebSocket" in window)
	{
		// have to use websocket over ssl
		this.url = "wss://nexulab.com:8888";
		// specific a 'echo-protocol' as a security.
		this.instance = new WebSocket(this.url, 'echo-protocol');

		this.instance.onopen = () => {
			this.onopen();
			// first, send your name to websocket server when you connected.
			var obj = {
				Name: this.webName,
				Reserved: "" 
			};
			var pkt = {
				Type: 'Command',
				Timestamp: (new Date()).getTime(),
				Status: 0,
				Parameters: {
					Cmd: 'Who_Am_I',
					Obj: obj
				}
			};
			var json = JSON.stringify(pkt);
			this.send(json);
		};

		this.instance.onmessage = (evt) => {
			this.onevent(evt);
		};

		this.instance.onclose = (e) => {
			switch (e.code){
			case 1000:	// CLOSE_NORMAL
				console.log("WebSocket: closed");
				break;
			default:	// Abnormal closure
				var that = this;
				this.timeout = setTimeout(function() {
					console.debug("WebSocketClient: reconnecting...");
					that.open();
				},10000);
				break;
			}
			this.onclose(e);
		};

		this.instance.onerror = (e) => {
			switch (e.code) {
			case 'ECONNREFUSED':
				var that = this;
				this.timeout = setTimeout(function() {
					console.debug("WebSocketClient: reconnecting...");
					that.open();
				},10000);
				break;
			default:
				this.onerror(e);
				break;
			}
		};
	} else {
		// The browser doesn't support WebSocket
		alert("WebSocket NOT supported by your Browser!");
	}
}
WebSocketClient.prototype.send = function(data, option) {
	try {
		this.instance.send(data);
	} catch (e) {
		this.instance.emit('error', e);
	}
}
WebSocketClient.prototype.reconnect = function(e) {
	console.debug('WebSocketClient: retry in ${this.autoReconnectInterval}ms', e);
	this.instance.removeAllListeners();
	var that = this;
	setTimeout(function() {
		console.debug("WebSocketClient: reconnecting...");
		that.open(that.url);
	},this.autoReconnectInterval);
}
WebSocketClient.prototype.onopen = function(e) { console.debug("WebSocketClient: open", arguments); }
WebSocketClient.prototype.onevent = function(data) {
	//console.log("WebSocketClient: message", arguments);
	var json = JSON.parse(data.data);
	// check which type received
	if (json.Type === 'Data') {
		// Gateway data is in the Paramters.Obj, please reference another json format structure doc of gateway data
		// to know what the format is
		this.onGatewayData(json.Parameters.Obj);
	} else if (json.Type === 'Ack') {
		this.onack(json.Parameters.Cmd, json.Status);
	}
}
WebSocketClient.prototype.onerror = function(e) { console.debug("WebSocketClient: error", arguments); }
WebSocketClient.prototype.onclose = function(e) { console.debug("WebSocketClient: closed", arguments); }
WebSocketClient.prototype.onack = function(ackCmd, status) {
	console.debug("WebSocketClient: ack", arguments);
	// check whick command's ack from server.
	switch (ackCmd) {
		case 'Who_Am_I':
			if (status == 0) {
				this.connected = true;
			}
			break;
        case 'Normal_Mode':
		case 'Live_Data':
		case 'Current_Data':
        // server response, tell web the gateway is exist
		case 'Upgrade_Firmware':
			if (status != 0) {
				alert('can not find the gateway');
			}
			break;
        // gateway response, tell web the gateway's status on the upgrade.
        case 'FW_Upgrade':
			if (status == 0) {
				alert('gateway upgrade is successful');
			} else {
				alert('gateway upgrade is failure');
			}
			break
		default:
			break;
	}
}
WebSocketClient.prototype.onGatewayData = function(data) {
	console.debug("WebSocketClient: data", arguments);
	// process gateway data here 
}
WebSocketClient.prototype.close = function() { this.instance.close(); }
WebSocketClient.prototype.send_package = function(cmd, gwName) {
	if (this.connected) {
		this.package.Timestamp = (new Date()).getTime();
		this.package.Parameters.Cmd = cmd;
    	var obj = {
			// modify the 'Name' with Mac address to choice whick gateway you want to sending
			//Name: "b8:27:eb:5c:2e:0b",
			Name: gwName,
		};
		this.package.Parameters.Obj = obj;

		this.send(JSON.stringify(this.package));
	} else {
		console.debug("the connection is not avaliable");
	}
}
WebSocketClient.prototype.normal = function(gatewayName) {
	this.send_package("Normal_Mode", gatewayName);
}
WebSocketClient.prototype.live = function(gatewayName) {
	this.send_package("Live_Data", gatewayName);
}
WebSocketClient.prototype.current = function(gatewayName) {
	this.send_package("Current_Data", gatewayName);
}
WebSocketClient.prototype.upgrade = function(gatewayName) {
	this.send_package("Upgrade_Firmware", gatewayName);
}
