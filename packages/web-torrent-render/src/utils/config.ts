// const otherAnnounce = [
//   "udp://explodie.org:6969",
//   "udp://tracker.coppersurfer.tk:6969",
//   "udp://tracker.empire-js.us:1337",
//   "udp://tracker.leechers-paradise.org:6969",
//   "udp://tracker.opentrackr.org:1337",
//   "wss://tracker.btorrent.xyz",
//   "wss://tracker.fastcast.nz",
//   "wss://tracker.openwebtorrent.com"
// ]

// const myAnnounce = [
//   "http://localhost:8000/announce",
//   "udp://0.0.0.0:8000",
//   "udp://localhost:8000",
//   "ws://localhost:8000"
// ]

// const trackers = ['wss://tracker.btorrent.xyz', 'wss://tracker.openwebtorrent.com']
const trackers = undefined;

export const rtcConfig = {
  'iceServers': [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:global.stun.twilio.com:3478'
      ]
    },
    {
      urls: [
        'turn:TODO:443?transport=udp',
        'turn:TODO:443?transport=tcp',
        'turns:TODO:443?transport=tcp'
      ],
      username: 'TODO',
      credential: 'TODO'
    }
  ]
}

export const torrentOpts = {
  announce: trackers
}

export const trackerOpts = {
  announce: trackers,
  rtcConfig: rtcConfig
}