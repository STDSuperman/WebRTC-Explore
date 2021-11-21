import { EventBus } from '@/utils'
import './index.scss'
import { useRef } from 'react'

const Remote = () => {
  const videoRef = useRef(null);
  return (
    <div className='remote-page'>
      <video ref={videoRef}></video>
    </div>
  );
}

export default Remote;
