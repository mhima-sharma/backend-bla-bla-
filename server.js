// server.js
const http = require('http');
const app = require('./app');
const server = http.createServer(app);

const { initSocket } = require('./socket');
initSocket(server); // initialize socket.io

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
