/// <reference types="vite/client" />

declare interface Window {
  mozRTCPeerConnection: RTCPeerConnection;
  webkitRTCPeerConnection: RTCPeerConnection;
}