import { useState } from 'react'
import { render, init } from './torrent-render'
import { Button, Input, Card, Row, Col, message } from 'antd'
import './index.less'
import DownloadStatistic, { ITorrentInfo } from './download-statistic'
import prettierBytes from 'prettier-bytes'

const defaultMagnetURL =
  'magnet:?xt=urn:btih:f537afe28647f397760237be9d5d595ce914287d&dn=dist&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

export default function () {
  const [torrentMagnetURL, setTorrentMagnetURL] = useState(defaultMagnetURL)
  const [showDownloadPanel, setShowDownloadPanel] = useState(false)
  const [torrentInfo, setTorrentInfo] = useState<ITorrentInfo>({
    downloadedBytes: 0,
    downloadedSpeed: '0 KB/s',
    progress: '0%',
    magnetURI: '',
    peers: 0
  })

  const startServiceWorker = () => {
    init()
      .then(() => {
        message.success('注册 ServiceWorker 成功')
      })
      .catch(msg => {
        message.error(msg)
      })
  }

  const startDownloadTorrent = () => {
    setShowDownloadPanel(true)
    render(torrentMagnetURL)
      .then((torrentInstance: any) => {
        torrentInstance.on('download', function () {
          const progress = (100 * torrentInstance.progress).toFixed(1)
          setTorrentInfo({
            downloadedBytes: prettierBytes(torrentInstance.downloaded),
            downloadedSpeed: prettierBytes(torrentInstance.downloadSpeed) + '/s',
            progress: `${progress}%`,
            magnetURI: torrentMagnetURL,
            peers: torrentInstance.numPeers
          })
        })
      })
  }
  return (
    <div className="render-torrent-container">
      <Card
        title="Render Torrent"
        style={{
          width: '90%',
          margin: '20px auto'
        }}
      >
        <Input
          defaultValue={defaultMagnetURL}
          type="text"
          onChange={e => setTorrentMagnetURL(e.target.value)}
        ></Input>
        <Row
          justify="center"
          style={{
            margin: '20px'
          }}
        >
          <Col>
            <Button onClick={startDownloadTorrent}>开始抓取</Button>
          </Col>
          <Col>
            <Button onClick={startServiceWorker}>测试拦截</Button>
          </Col>
        </Row>
      </Card>
      {
        showDownloadPanel && <DownloadStatistic torrentInfo={torrentInfo}/>
      }
    </div>
  )
}
