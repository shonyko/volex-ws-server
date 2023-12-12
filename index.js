const httpServer = require('http').createServer();
const { Server } = require('socket.io');
const io_server = new Server(httpServer, {
	cors: {
		origin: '*',
		credentials: false,
	},
});

// CONSTANTS
const PORT = process.env.PORT ?? 3001;

// MAIN
io_server.on('connection', socket => {
	console.log(`New socket: ${socket.id}`);
});

httpServer.listen(PORT, _ => console.log(`Server listening on port ${PORT}`));

// Connection to broker
const { Events, Services } = require('./enums.js');
const io_client = require('socket.io-client');

const { BROKER_ADDR } = require('./config.js');

console.log(`Broker addr: ${BROKER_ADDR}`);
const socket = io_client(BROKER_ADDR);

function register() {
	socket.emit(Events.Socket.REGISTER, Services.FRONTEND, ({ success, err }) => {
		if (!success) {
			console.log(`Could not register: `, err);
			console.log(`Retrying in 2 seconds`);
			return setTimeout(register, 2000);
		}
	});
}

socket.on('connect', _ => {
	console.log('Socket connected!');
	register();
});

socket.on('connect_error', err => {
	console.log(`Could not connect due to `, err);
});

socket.onAny((event, ...args) => {
	console.log(`[${event}]: `, args[0]);
	io_server.emit(event, args[0]);
});
