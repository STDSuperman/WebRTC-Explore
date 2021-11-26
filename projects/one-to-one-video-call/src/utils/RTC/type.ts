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
	START_P2P_CONNECTION = "START_P2P_CONNECTION",
  TRACK = "TRACK",
}