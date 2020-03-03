const express = require('express');

const app = express();

const bodyParser = require("body-parser");

const cors = require('cors')

let path = require('path');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// app.use(cors());

// app.use( express.static(path.join(__dirname + '/web/')));

app.use ('/static', express.static('web'));
app.use('/build', express.static('build'));
app.listen(4000, () => console.log('listening on port 4000'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/visor.html'));
});

app.get('/web/viewer.html', function(req, res) {
  res.sendFile(path.join(__dirname + '/web/viewer.html'));
})
