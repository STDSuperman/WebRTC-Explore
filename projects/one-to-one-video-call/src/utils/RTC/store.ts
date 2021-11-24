let peerId = 0;
export const peerStore: Record<string, RTCPeerConnection> = {};

export const setPeer = (id: string, peer: RTCPeerConnection) => {
  peerStore[id] = peer;
}

export const getPeer = (id: string) => peerStore[id];

export const getUniId = () => String(peerId++);

export const findOnePeerIdWithRandom = (exceptId: string) => {
  const otherPeerIds = Object.keys(peerStore)
    .filter(id => exceptId !== id);
  return otherPeerIds[
    Math.floor(Math.random() * otherPeerIds.length)
  ];
}