import { io } from 'socket.io-client';

// Initialize the socket connection
let socket = null;

const initializeSocket = (userId) => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      query: { userId },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log(`Socket connected for user ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected for user ${userId}`);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

const getSocket = () => {
  if (!socket) {
    console.error('Socket is not initialized. Call initializeSocket first.');
    return null;
  }
  return socket;
};

export { initializeSocket, disconnectSocket, getSocket };