import React from 'react'
import './index.scss'
import { useRef, useEffect, useState } from 'react'
import { getP2PConnectionInstance } from '@/utils/p2p-sdk'

const Remote2 = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    getP2PConnectionInstance()
      .then(p2pInstance => {
        p2pInstance.on('P2PConnection', e => {
          console.log(e)
        });
        p2pInstance.call();
      });
  }, [])

  return (
    <div className='remote-page'>
      <video ref={videoRef} autoPlay controls></video>
    </div>
  );
}

export default Remote2;
