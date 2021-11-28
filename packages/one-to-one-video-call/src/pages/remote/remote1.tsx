import React from 'react'
import './index.scss'
import { useRef, useEffect, useState } from 'react'
import { getP2PConnectionInstance, P2PSocketEventsType } from '@/utils/p2p-sdk'
import { createAndAddStream } from '@/utils/helper'

const Remote1 = () => {
  const videoRef = useRef(null);
  const [targetConnectId, setTargetConnectId] = useState(null);
  const [p2pInstance, setP2pInstance] = useState(null);

  useEffect(() => {
    getP2PConnectionInstance()
      .then(p2pInstance => {
        setP2pInstance(p2pInstance)
        p2pInstance.on(P2PSocketEventsType.track, (e: RTCTrackEvent) => {
          if (!videoRef.current) return;
          console.log('组件拿到流啦')
          if (videoRef.current.srcObject !== e.streams[0]) {
            videoRef.current.srcObject = e.streams[0];
            console.log('remote received remote stream');
          }
        })
      });
  }, [])

  useEffect(() => {
    if (p2pInstance && videoRef.current) {
      createAndAddStream(p2pInstance?.peerInstance, videoRef)
    }
  }, [p2pInstance])

  return (
    <div className='remote-page'>
      <video ref={videoRef} autoPlay controls></video>
      <input onChange={val => setTargetConnectId(val.target.value)}></input>
      <button onClick={() => p2pInstance?.call(targetConnectId)}>呼叫</button>
    </div>
  );
}

export default Remote1;
