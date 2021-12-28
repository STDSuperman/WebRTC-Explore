import './index.less'
import { Spin, Alert } from 'antd';

export default function () {
  return (
    <div className="global-loading">
      <Spin
        tip="Loading..."
        size="large"
        style={{
          'maxHeight': '100vh'
        }}
      >
        <Alert
          type="info"
          style={{
            height: '100vh'
          }}
        />
    </Spin>
    </div>
  )
}
