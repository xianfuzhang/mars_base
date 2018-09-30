const path = require('path');
const express = require('express');
var compression = require('compression')

var proxy = require('http-proxy-middleware');

let app = express();

var wsProxy = proxy('/mars', {target:'http://localhost:4001', ws:false});
app.use(wsProxy);
// 启用gzip
app.use(compression());

app.use('/', express.static(path.resolve('./public')));

app.listen(3000);
