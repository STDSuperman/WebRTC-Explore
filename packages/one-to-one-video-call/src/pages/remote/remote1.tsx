import React from 'react'
import './index.scss'
import { useRef, useEffect } from 'react'
import { getP2PConnectionInstance } from '@/utils/p2p-sdk'

const Remote1 = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    getP2PConnectionInstance({ socketConfig: { path: '/socket.io/p2p' } })
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

export default Remote1;
