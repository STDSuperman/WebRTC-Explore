import React, { ReactElement } from 'react'
import { Statistic, Row, Col, Input, Form, Card } from 'antd'
export interface ISeedInfo {
  uploadedByte?: string
  uploadSpeed?: string
}

interface IProps {
  torrentInfo: any
  seedInfo: ISeedInfo
}

export default (props: IProps): ReactElement => {
  const { torrentInfo, seedInfo } = props
  return (
    <Card
      title="Seed Info"
      style={{
        width: '90%'
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form name="basic" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Form.Item label="Torrent MagnetURI" name="username">
              <Input defaultValue={torrentInfo.magnetURI} />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Statistic title="Seed Files" value={torrentInfo?.files.length} />
        </Col>
        <Col span={12}>
          <Statistic title="Torrent Filename" value={torrentInfo?.name} />
        </Col>
        <Col span={12}>
          <Statistic title="Uploaded Bytes" value={seedInfo.uploadedByte} />
        </Col>
        <Col span={12}>
          <Statistic title="Upload Speed" value={seedInfo.uploadSpeed} />
        </Col>
      </Row>
    </Card>
  )
}
