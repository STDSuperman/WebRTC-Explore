import React from 'react'
import { Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons';
import { seedFiles } from '../index'
import debounce from 'debounce';


const { Dragger } = Upload;

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

const antUpload: React.FC =  () => {
  return (
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
  )
}

export default antUpload;