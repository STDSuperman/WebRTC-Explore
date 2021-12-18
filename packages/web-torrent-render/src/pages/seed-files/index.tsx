import WebTorrent from 'webtorrent/webtorrent.min.js';
import React from 'react'
import { Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons';
import debounce from 'debounce';

const { Dragger } = Upload;

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

const rtcConfig = {
  'iceServers': [
    {
      'urls': ['stun:stun.l.google.com:19305', 'stun:stun1.l.google.com:19305']
    }
  ]
}

const torrentOpts = {
  announce: trackers
}

const trackerOpts = {
  announce: trackers,
  rtcConfig: rtcConfig
}

const client = new WebTorrent({
  tracker: trackerOpts
})

export const seedFiles = (files) => {
  client.seed(files, torrentOpts, torrent => {
    // console.log(torrent, torrent.magnetURI);
    torrent.on('upload', function (bytes) {
      console.log('just uploaded: ' + bytes)
      console.log('total uploaded: ' + torrent.uploaded);
      console.log('upload speed: ' + torrent.uploadSpeed)
    })

    console.log('client.seed done', {
      magnetURI: torrent.magnetURI,
      ready: torrent.ready,
      paused: torrent.paused,
      done: torrent.done,
    });

    /** node 环境 */
    // const client2 = new WebTorrent();
    // client2.add(torrent.magnetURI, (trr) => {
    //   const server = trr.createServer();
    //   console.log(trr.files.length, trr.magnetURI)
    //   server.listen(3001, () => {
    //     console.log('seed server is running: http://localhost:3001')
    //   })
    // })
  })
}

const bufferFileList = []

const fileListHandler = debounce(() => {
  if (bufferFileList.length === 0) return;
  console.log(bufferFileList)
  seedFiles(bufferFileList);
}, 200)

const props = {
  name: 'file',
  multiple: true,
  directory: true,
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  beforeUpload(info) {
    bufferFileList.push(info);
    fileListHandler();
    return false;
  }
};

const SeedFiles: React.FC = () => {
  return (
    <div>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibit from uploading company data or other
          band files
        </p>
      </Dragger>
    </div>
  )
}

export default SeedFiles;