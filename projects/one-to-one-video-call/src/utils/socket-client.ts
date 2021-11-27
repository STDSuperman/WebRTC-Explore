import SocketClient from 'socket.io-client';
import { SERVER_PORT } from '@/utils/constant'

const SOCKET_URL = `http://localhost:${SERVER_PORT}`;

export const getSocketInstance = (path: string = '') => {
  return SocketClient(SOCKET_URL, {
    path
  });
}