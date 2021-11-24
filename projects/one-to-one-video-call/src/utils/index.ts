import { EventEmitter } from 'events';

export const getEventEmitter = (): EventEmitter => {
  return new EventEmitter();
}

export const PeerConnection = window.RTCPeerConnection
  || window?.mozRTCPeerConnection
  || window?.webkitRTCPeerConnection;