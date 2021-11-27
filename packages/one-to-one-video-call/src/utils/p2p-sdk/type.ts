import { ISocketConfig } from '@/utils/socket-client'
export interface IPeerConnectionWithMediaStream {
	RTCPeer: RTCPeerConnection;
	mediaStream: MediaStream;
}

export interface ICandidateInfo {
	candidate: RTCIceCandidate;
}

export interface IOfferInfo {
	offer: RTCSessionDescriptionInit;
}

export enum P2PSocketEventsType {
	P2PConnection = "P2PConnection",
  track = "track",
}

export type IEmiterCallback = (...args: unknown[]) => void;

export interface IBaseConfig {
	socketConfig: ISocketConfig;
}