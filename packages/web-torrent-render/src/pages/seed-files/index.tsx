import WebTorrent from 'webtorrent/webtorrent.min.js';
import React, { useEffect, useState } from 'react'
import dragDrop from 'drag-drop';
import { trackerOpts, torrentOpts } from '../../utils/config'
import './index.less'
import prettierBytes from 'prettier-bytes'
import SeedStatistic, { ISeedInfo } from './seed-statistic';
import EmptyComponent from './empty'

export type ITorrentInfo = WebTorrent.Torrent

const client = new WebTorrent({
  tracker: trackerOpts
})

export const seedFiles = (files) => {
  return new Promise((resolve) => {
    client.seed(files, torrentOpts, torrent => {
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
  const [seedInfo, setSeedInfo] = useState<ISeedInfo>({
    uploadSpeed: '0 KB/s',
    uploadedByte: '0 KB'
  })
  useEffect(() => {
    dragDrop('body', files => {
      seedFiles(files)
        .then((torrent: any) => {
          torrent.on('upload', function () {
            setSeedInfo({
              uploadedByte: prettierBytes(torrent.uploaded),
              uploadSpeed: prettierBytes(torrent.uploadSpeed) + '/s'
            })
          })
          setTorrentInfo(torrent)
        });
    })
  }, [])

  return (
    <div className="seed-file-container">
      {
        torrentInfo.magnetURI
        ? <SeedStatistic
            torrentInfo={torrentInfo}
            seedInfo={seedInfo}
          />
        : <EmptyComponent />
      }
    </div>
  )
}

export default SeedFiles;