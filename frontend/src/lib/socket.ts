import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('sass_access_token');
    socket = io(process.env.NEXT_PUBLIC_ALERT_WS_URL + '/alerts', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      transports: ['websocket'],
    });

    socket.on('connect', () => console.log('🔌 Socket connected:', socket?.id));
    socket.on('disconnect', (reason) => console.warn('Socket disconnected:', reason));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));
  }
  return socket;
}
