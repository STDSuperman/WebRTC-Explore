import './index.scss'
import { useRef, useEffect, useState } from 'react'
import { initPeer, startCall } from '@/utils/helper'
import type { IPeerConnectionWithMediaStream } from '@/utils/helper'

const Local = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [
    peerWithMediaStream,
    setPeerWithMediaStream
  ] = useState<IPeerConnectionWithMediaStream>();

  useEffect(() => {
    initPeer(videoRef)
      .then(peerWithMda => {
        setPeerWithMediaStream(peerWithMda);
      });
  }, [])

  return (
    <div className='local-page'>
      <video ref={videoRef} autoPlay controls></video>
      <div className='start-call' onClick={() => {
        peerWithMediaStream
          && startCall(peerWithMediaStream?.RTCPeer)
      }}>呼叫</div>
    </div>
  );
}

export default Local;
