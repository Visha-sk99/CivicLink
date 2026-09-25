import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const socket = io(URL, {
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  autoConnect: true,
});

export const joinUserRoom = (userId) => {
  if (userId) {
    socket.emit('join_room', userId);
    console.log('Joined room for user:', userId);
  }
};

export default socket;