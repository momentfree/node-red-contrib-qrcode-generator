module.exports = function(RED) {
	"use strict";

	var QRCode = require('qrcode');

	function sanitizeSpecialChar (valsan){
		try{
			var valsanret = valsanret.replace("\\", "\\\\");
			valsanret= valsanret.replace(":", "\\:");
			valsanret= valsanret.replace(",", "\\,");
			valsanret= valsan.replace(";", "\\;");
			return valsanret;
		}catch (e) {
			return "";
		}
	}


	function qrcodeGenerateString (node){
		var qrencodemsg="";
		if(!node.qrcodeinput){
			// no input, use configuration parameters from editor to create actionable text
			switch (node.qrtype) {
				case "text2qr":
					qrencodemsg=node.text2qrText;
					break;
				case "wifi2qr":
					var ssid_san;
					var wifipwd_san;
					if (node.ssid) {
						// sanitize ssid
						ssid_san=sanitizeSpecialChar(node.ssid);
					} else{
						ssid_san="";
					}
					if (node.credentials.wifipwd){
						// sanitize wifipwd
						wifipwd_san=sanitizeSpecialChar(node.credentials.wifipwd);
					}else{
						wifipwd_san="";
					}
					qrencodemsg="WIFI:S:" + ssid_san +";T:" + node.wifitype + ";P:" + wifipwd_san + ";H:"+node.hiddenssid.toString()+";";
					break;
				case "phone2qr":
					qrencodemsg="tel:" + node.phonenum;
					break;
				case "sms2qr":
					var prefix="sms:";
					if(node.smstext){
						// documentation old at https://github.com/zxing/zxing/wiki/Barcode-Contents ?
						// sms:+18005551212:This%20is%20my%20text%20message. Won't work with android 9 and earlier.
						// Working version is:
						// sms:+18005551212?&body=This%20is%20my%20text%20message.
						qrencodemsg=prefix + node.smsphonenum +"?&body="+encodeURIComponent(node.smstext);
					} else {
						qrencodemsg=prefix + node.smsphonenum;
					}
					break;
				case "email2qr":
					var composemail="mailto:"+node.mailto;
					if(node.mailsubject){
						composemail= composemail + "?subject=" + encodeURIComponent(node.mailsubject);
						if(node.mailbody){
							composemail= composemail + "&body=" + encodeURIComponent(node.mailbody);
						}
					}
					qrencodemsg=composemail;
					break;
				case "map2qr":
					qrencodemsg="geo:" + node.latitude + "," + node.longitude;
					break;
				default:
					qrencodemsg=node.text2qrText;
			}
		}else{
			// get actionable text from input
			qrencodemsg=node.qrcodeinput;
		}

		return qrencodemsg;
	}

	function requestQRCode(node,msg,callback){
		var qrencodemsg;
		try {
			node.status({fill:"blue",shape:"dot",text:"molding QRcode.."});
			qrencodemsg = qrcodeGenerateString(node);
			// Colorize QRCode adding alpha-chan to RGB
			var alphachan="FF";
			var opts = {
				color: {
					dark:node.colordark+alphachan,
					light:node.colorlight+alphachan
				}
			}
		} catch (e) {
			callback(e);
			return;
		}

		QRCode.toDataURL(qrencodemsg, opts, function (err, dataUri) {
			if (err) {
				callback(err);
				return;
			} else {
				node.dataUri=dataUri;
				callback();
			}
		});
	}

	function QrCodeGeneratorNode(config) {
		RED.nodes.createNode(this,config);
		var node = this;
		node.qrtype = config.qrtype || "text2qr";
		node.text2qrText = config.text2qrText || "";
		node.ssid = config.ssid;
		node.wifitype = config.wifitype;
		node.phonenum = config.phonenum;
		node.smsphonenum = config.smsphonenum;
		node.smstext = config.smstext;
		node.mailto = config.mailto;
		node.mailsubject = config.mailsubject;
		node.mailbody = config.mailbody;
		node.latitude = config.latitude;
		node.longitude = config.longitude;
		node.hiddenssid=config.hiddenssid || false;
		node.colorlight = config.colorlight || "#ffffff";
		node.colordark = config.colordark || "#000000";

		node.on('input', function(msg) {
			// get input & delete it
			node.qrcodeinput = msg.qrcodeinput || "";
			delete msg.qrcodeinput;
			// generate qrcode
			requestQRCode(node,msg,function(err) {
					if (err) {
						node.status({fill:"red",shape:"dot",text:"Error: see details in debug win"});
						node.error(err,msg);
					} else {
						// Request Successfull. Output data
						RED.util.setMessageProperty(msg,"payload",node.dataUri);
						node.send(msg);
						// reset node status
						node.status({});
					}
			});
		});
	}

	RED.nodes.registerType("qrcode-generator",QrCodeGeneratorNode,{
		credentials: {
			wifipwd: {type:"password"}
		}
	});
}
