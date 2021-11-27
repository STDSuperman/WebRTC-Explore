import SocketClient from 'socket.io-client';
import { SERVER_PORT } from '@/utils/constant'
import type { ManagerOptions, SocketOptions } from 'socket.io-client'

export type ISocketConfig = Partial<ManagerOptions & SocketOptions>;

const SOCKET_URL = `http://localhost:${SERVER_PORT}`;

export const getSocketInstance = (
  socketOptions: ISocketConfig
) => {
  return SocketClient(SOCKET_URL, socketOptions);
}