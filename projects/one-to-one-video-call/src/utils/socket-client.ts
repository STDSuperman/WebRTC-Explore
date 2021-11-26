import SocketClient from 'socket.io-client';

const SOCKET_URL = 'http://localhost:7001';

export const getSocketInstance = (path: string) => {
  return SocketClient(SOCKET_URL, {
    path
  });
}