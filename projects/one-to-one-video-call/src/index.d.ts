/// <reference types="vite/client" />

declare interface Window {
  mozRTCPeerConnection: RTCPeerConnection;
  webkitRTCPeerConnection: RTCPeerConnection;
}
declare interface RTCPeerConnection {
  customData: {
    type?: string;
  };
}