import WebTorrent from 'webtorrent/webtorrent.min.js';
import React, { useEffect, useState } from 'react'
import dragDrop from 'drag-drop';
import { trackerOpts, torrentOpts } from '../../utils/config'
import './index.less'
import prettierBytes from 'prettier-bytes'
import SeedStatistic from './seed-statistic';
import EmptyComponent from './empty'

export type ITorrentInfo = WebTorrent.Torrent

const client = new WebTorrent({
  tracker: trackerOpts
})

export const seedFiles = (files) => {
  return new Promise((resolve) => {
    client.seed(files, torrentOpts, torrent => {
      // console.log(torrent, torrent.magnetURI);
      torrent.on('upload', function (bytes) {
        console.log('just uploaded: ' + bytes)
        console.log('total uploaded: ' + torrent.uploaded);
        console.log('upload speed: ' + prettierBytes(torrent.uploadSpeed) + '/s')
      })

      const progress = (100 * torrent.progress).toFixed(1)
      console.log('client.seed done', {
        magnetURI: torrent.magnetURI,
        ready: torrent.ready,
        paused: torrent.paused,
        done: torrent.done
      });
      resolve(torrent);
    })
  })
}

const SeedFiles: React.FC = () => {
  const [torrentInfo, setTorrentInfo] = useState<any>({})
  useEffect(() => {
    dragDrop('body', seedFiles)
      .then(torrent => {
        setTorrentInfo(torrent)
      })
  }, [])

  return (
    <div className="seed-file-container">
      {
        torrentInfo.magnetURI
        ? <SeedStatistic torrentInfo={torrentInfo}/>
        : <EmptyComponent />
      }
    </div>
  )
}

export default SeedFiles;