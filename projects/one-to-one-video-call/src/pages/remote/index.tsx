import { EventBus } from '@/utils'
import './index.scss'
import { useRef, useEffect } from 'react'
import { initPeer } from '@/utils/helper'

const Remote = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    initPeer(videoRef);
  }, [])

  return (
    <div className='remote-page'>
      <video ref={videoRef}></video>
    </div>
  );
}

export default Remote;
