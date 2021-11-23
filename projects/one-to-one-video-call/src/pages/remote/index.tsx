import { EventBus } from '@/utils'
import './index.scss'
import { useRef, useEffect, useState } from 'react'
import { initPeer, IPeerConnectionWithMediaStream } from '@/utils/helper'

const Remote = () => {
  const videoRef = useRef(null);
  const [
    peerWithMediaStream,
    setPeerWithMediaStream
  ] = useState<IPeerConnectionWithMediaStream>();

  useEffect(() => {
    initPeer(videoRef)
      .then(peerWithMda => {
        setPeerWithMediaStream(peerWithMda);
        peerWithMda.RTCPeer.ontrack = track => {
          console.log(track);
        }
      });
  }, [])

  return (
    <div className='remote-page'>
      <video ref={videoRef} autoPlay controls></video>
    </div>
  );
}

export default Remote;
