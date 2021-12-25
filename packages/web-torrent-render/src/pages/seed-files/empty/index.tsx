import { ReactElement } from 'react'
import { Empty } from 'antd'
import './index.less'

export default (): ReactElement => {
  return (
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      imageStyle={{
        height: 300
      }}
      className='empty-container'
      description={<span>拖拽上传文件</span>}
    ></Empty>
  )
}
