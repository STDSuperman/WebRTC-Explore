import React, { ReactElement } from 'react'
import { Statistic, Row, Col, Input, Form, Card } from 'antd'

export interface ITorrentInfo {
  downloadedBytes: number;
  downloadedSpeed: string;
  progress: string;
  magnetURI: string;
  peers: number;
}

interface IProps {
  torrentInfo: ITorrentInfo
}

export default (props: IProps): ReactElement => {
  const { torrentInfo } = props
  return (
    <Card title="Download Info" style={{
        width: '90%',
        margin: '20px auto'
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          fields={[{ name: ['magnetURI'], value: torrentInfo.magnetURI }] }
        >
          <Form.Item
            label="Torrent MagnetURI"
            name="magnetURI"
          >
            <Input/>
          </Form.Item>
        </Form>
        </Col>
        <Col span={12}>
          <Statistic title="Download Bytes" value={torrentInfo.downloadedBytes} />
        </Col>
        <Col span={12}>
          <Statistic title="Download Speed" value={torrentInfo.downloadedSpeed} />
        </Col>
        <Col span={12}>
          <Statistic title="Download Progress" value={torrentInfo.progress} />
        </Col>
        <Col span={12}>
          <Statistic title="Online Peers" value={torrentInfo.peers} />
        </Col>
      </Row>
    </Card>
  )
}
