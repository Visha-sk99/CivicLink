import { io } from 'socket.io-client';

// Connect to backend WebSocket
const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000');

export default socket;