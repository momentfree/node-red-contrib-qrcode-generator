# node-red-contrib-qrcode-generator
Create QRCode from action text. Based on [node-qrcode](https://github.com/soldair/node-qrcode) module.

## Install
Install from PALETTE Manager or run the following command in your NODE-RED user directory typically: \~/.node-red
```
npm install node-red-contrib-qrcode-generator
```
## Usage
Processes string to generate QRCode. Use the editor as an helper to forge action text string (link, sms, wifi etc.) or post your custom string using `msg.qrcodeinput` input property. [Here](https://github.com/zxing/zxing/wiki/Barcode-Contents) is documentation to create your custom action text. Remember QRCode are specific for some devices for example Wi-Fi Network config works only on Android or iOS 11+. There are a lot of different standards on actionable text, the helper (editor configuration) aims to cover some of the most used. Finally node returns DataUri format image in `msg.payload`.

You can render DataUri result, in html page with img element, using template node with mustache:
```
<body>
  <img src="{{payload}}">
</body>
```
or you can link output to [image viewer node](https://flows.nodered.org/node/node-red-contrib-image-tools) and get a preview in your Node-Red workspace panel.

You can use different colors but keep in mind that light-color must be ligther than dark-color.

### Input
`msg.qrcodeinput` [Custom](https://github.com/zxing/zxing/wiki/Barcode-Contents) string, it will be used instead of editor configuration. e.g.:
```
msg.qrcodeinput = 'mailto:someone@yoursite.com';
```
creates QRcode with action text for sending sms to a specific number.

### Output
`msg.payload` Image in [DataURI](https://en.wikipedia.org/wiki/Data_URI_scheme) format.
