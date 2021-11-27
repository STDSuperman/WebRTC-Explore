import React from 'react'
import './index.scss'
import { useRef, useEffect, useState } from 'react'
import { P2PConnection } from '@/utils/p2p-sdk'

const Remote2 = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // const p2pInstance = new P2PConnection();
    // p2pInstance.on('P2PConnection', e => {
    //   console.log(e)
    // })
  }, [])

  return (
    <div className='remote-page'>
      <video ref={videoRef} autoPlay controls></video>
    </div>
  );
}

export default Remote2;
