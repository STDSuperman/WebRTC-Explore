import React from 'react';
import './index.scss'
import { useRef, useEffect, useState } from 'react'
import { initPeer, startCall } from '@/utils/RTC'
import { findOnePeerIdWithRandom } from '@/utils/RTC/store'

const Local = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const [connectPeerId, setConnectPeerId] = useState('');
  const [
    rtcPeerInstance,
    setRtcPeerInstance
  ] = useState<RTCPeerConnection>();

  useEffect(() => {
    initPeer(videoRef)
      .then(peer => {
        setRtcPeerInstance(peer);
        setConnectPeerId(findOnePeerIdWithRandom(peer.id));
      });
    initPeer(videoRef1);
  }, [])

  return (
    <div className='local-page'>
      <video ref={videoRef} autoPlay controls></video>
      <video ref={videoRef1} autoPlay controls></video>
      <button className='start-call' onClick={() => {
        rtcPeerInstance && startCall(rtcPeerInstance, connectPeerId, videoRef);
      }}>呼叫</button>
    </div>
  );
}

export default Local;
