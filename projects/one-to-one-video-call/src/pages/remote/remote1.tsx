import React from 'react'
import './index.scss'
import { useRef, useEffect, useState } from 'react'
import { P2PConnection } from '@/utils/p2p-sdk'

const Remote1 = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const p2pInstance = new P2PConnection();
    p2pInstance.on('P2PConnection', e => {
      console.log(e)
    });
    p2pInstance.call();
    p2pInstance.socketInstance.on('greetResult', val => console.log(val));
    p2pInstance.socketInstance.emit('greet', 1, 2, 3)
  }, [])

  return (
    <div className='remote-page'>
      <video ref={videoRef} autoPlay controls></video>
    </div>
  );
}

export default Remote1;
