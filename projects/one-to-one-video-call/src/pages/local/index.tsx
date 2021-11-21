import './index.scss'
import { useRef, useEffect } from 'react'
import { PeerConnection, EventBus } from '@/utils'

const Local = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 初始化 RTC
  const initPeer = async () => {
    const RTCPeer = new PeerConnection();
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localStream.getTracks().forEach(track => RTCPeer.addTrack(track));
    videoRef.current!.srcObject = localStream;
  }

  useEffect(() => {
    initPeer();
  }, [])

  return (
    <div className='local-page'>
      <video ref={videoRef} autoPlay controls></video>
    </div>
  );
}

export default Local;
