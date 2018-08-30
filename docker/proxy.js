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
// app.use('/index.html', express.static(path.resolve('./index.html')));
// app.use('/login.html', express.static(path.resolve('./login.html')));
// app.use('/js/', express.static(path.resolve('./js/')));
// app.use('/bootstrap-3.3.5/', express.static(path.resolve('./bootstrap-3.3.5/')));

app.listen(3000);
