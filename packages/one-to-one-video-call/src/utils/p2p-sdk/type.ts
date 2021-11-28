import {
	SocketEmitEnum,
	SocketListenEnum
}  from 'p2p-types'

export interface IPeerConnectionWithMediaStream {
	RTCPeer: RTCPeerConnection;
	mediaStream: MediaStream;
}

export enum P2PSocketEventsType {
	P2PConnection = "P2PConnection",
  track = "track"
}

export type ICommonEventCallback = (...args: unknown[]) => void;

export interface IBaseConfig {
	socketInstance: ISocketInstance;
}

export interface ISocketInstance {
	on: (event: SocketListenEnum, listener: ICommonEventCallback) => void;
	emit: (event: SocketEmitEnum, data: unknown) => void;
	id: string;
}