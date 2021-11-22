import { EventEmitter } from 'events';

export const EventBus = new EventEmitter;
export const PeerConnection = window.RTCPeerConnection
  || window?.mozRTCPeerConnection
  || window?.webkitRTCPeerConnection;