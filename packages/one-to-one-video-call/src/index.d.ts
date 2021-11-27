/// <reference types="vite/client" />

declare interface Window {
  mozRTCPeerConnection: RTCPeerConnection;
  webkitRTCPeerConnection: RTCPeerConnection;
}
declare interface RTCPeerConnection {
  id: string;
  eventEmitter: any;
  new (configuration?: RTCConfiguration): RTCPeerConnection;
}