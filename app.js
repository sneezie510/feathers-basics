const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const MongoClient = require('mongodb').MongoClient;
const service = require('feathers-mongodb');

// This creates an app that's both an Express and Feathers app
const app = express(feathers());

// Enable CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Turn on JSON body parsing for REST services
app.use(express.json())
// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport using Express
app.configure(express.rest());

// Configure the Socket.io transport
app.configure(socketio());

// On any real-time connection, add it to the `everybody` channel
app.on('connection', connection => app.channel('everybody').join(connection));

// Publish all events to the `everybody` channel
app.publish(() => app.channel('everybody'));

// Initialize the messages service
app.use('messages', service({
  paginate: {
    default: 10,
    max: 25
  }
}));

// Set up an error handler that gives us nicer errors
app.use(express.errorHandler());

// Start the server on port 3030
const server = app.listen(3030);

// Connect to your MongoDB instance(s)
MongoClient.connect('mongodb://localhost:27017/feathers')
  .then(function (client) {
    // Set the model now that we are connected
    app.service('messages').Model = client.db('feathers').collection('messages');

    // Now that we are connected, create a dummy Message
    app.service('messages').create({
      text: 'Message created on server'
    }).then(message => console.log('Created message', message));
  }).catch(error => console.error(error));

server.on('listening', () => console.log('Feathers REST API started at http://localhost:3030'));