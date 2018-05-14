// Create a Feathers application
const app = feathers();

const rest = feathers.rest('http://localhost:3030');

// Initialize a REST connection
const socket = io('http://localhost:3030');

// Listen to new messages being created
socket.on('messages created', message =>
  console.log('Someone created a message', message)
);

socket.emit('create', 'messages', {
  text: 'Hello from socket'
}, (error, result) => {
  if (error) throw error
  socket.emit('find', 'messages', (error, messageList) => {
    if (error) throw error
    console.log('Current messages', messageList);
  });
});

// Configure the REST client to use 'window.fetch'
app.configure(rest.fetch(window.fetch));

// // Listen to new messages being created
// app.service('messages').on('created', message => {
//   console.log('Created a new message locally', message);
// });

// async function createAndList() {
//   await app.service('messages').create({
//     text: 'Hello from Feathers browser client'
//   });

//   const messages = await app.service('messages').find();

//   console.log('Messages', messages);
// }

// createAndList();
