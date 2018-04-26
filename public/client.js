const app = feathers();
const memory = require('feathers-memory');

// Create a websocket connecting to our Feathers server
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

// Register a simple todo service that return the name and a text
app.use('todos', {
  async get(name) {
    // Return an object in the form of { name, text }
    return {
      name,
      text: `You have to do ${name}`
    };
  }
});

// A function that gets and logs a todo from the service
async function logTodo(name) {
  // Get the service we registered above
  const service = app.service('todos');
  // Call the `get` method with a name
  const todo = await service.get(name);

  // Log the todo we got back
  console.log(todo);
}

logTodo('dishes');

app.use('messages', feathers.memory({
  paginate: {
    default: 10,
    max: 25
  }
}));

// async function createAndFind() {
//   // Stores a reference to the messages service so we don't have to call it all the time
//   const messages = app.service('messages');

//   for (let counter = 0; counter < 100; counter++) {
//     await messages.create({
//       counter,
//       message: `Message number ${counter}`
//     });
//   }

//   // We show 10 entries by default. By skipping 10 we go to page 2
//   const page2 = await messages.find({
//     query: { $skip: 10 }
//   });

//   console.log('Page number 2', page2);

//   // Show 20 items per page
//   const largePage = await messages.find({
//     query: { $limit: 20 }
//   });

//   console.log('20 items', largePage);

//   // Find the first 10 items with counter greater 50 and less than 70
//   const counterList = await messages.find({
//     query: {
//       counter: { $gt: 50, $lt: 70 }
//     }
//   });

//   console.log('Counter greater 50 and less than 70', counterList);

//   // Find all entries with text "Message number 20"
//   const message20 = await messages.find({
//     query: {
//       message: 'Message number 20'
//     }
//   });

//   console.log('Entries with text "Message number 20"', message20);
// }

// createAndFind();