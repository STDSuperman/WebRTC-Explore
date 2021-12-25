import React, { ReactElement } from 'react'
import { Statistic, Row, Col, Button } from 'antd';

interface IProps {
  torrentInfo: any;
}

export default (props: IProps): ReactElement => {
  return (
    <Row gutter={16}>
    <Col span={12}>
      <Statistic title="Active Users" value={112893} />
    </Col>
    <Col span={12}>
      <Statistic title="Account Balance (CNY)" value={112893} precision={2} />
      <Button style={{ marginTop: 16 }} type="primary">
        Recharge
      </Button>
    </Col>
    <Col span={12}>
      <Statistic title="Active Users" value={112893} loading />
    </Col>
  </Row>
  );
}