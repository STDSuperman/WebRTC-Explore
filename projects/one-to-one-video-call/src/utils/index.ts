import { EventEmitter } from 'events';

export const EventBus = EventEmitter;
export const PeerConnection = window.RTCPeerConnection
  || window?.mozRTCPeerConnection
  || window?.webkitRTCPeerConnection;