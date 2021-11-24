import './index.scss'
import { useRef, useEffect, useState } from 'react'
import { initPeer, IPeerConnectionWithMediaStream } from '@/utils/RTC'

const Remote = () => {
  const videoRef = useRef(null);
  const [
    peerWithMediaStream,
    setPeerWithMediaStream
  ] = useState<IPeerConnectionWithMediaStream>();

  useEffect(() => {
    initPeer(videoRef);
  }, [])

  return (
    <div className='remote-page'>
      <video ref={videoRef} autoPlay controls></video>
    </div>
  );
}

export default Remote;
