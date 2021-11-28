import React from 'react'
import { logger } from './logger'

export const createAndAddStream = async (
  peer: RTCPeerConnection,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  // 获取视频流
  const mediaStream = await navigator.mediaDevices
    .enumerateDevices()
    .then(devices => {
      const cam = devices.find(function (device) {
        return device.kind === 'videoinput'
      })
      const mic = devices.find(function (device) {
        return device.kind === 'audioinput'
      })
      const constraints = { video: cam && true, audio: mic }
      return navigator.mediaDevices.getUserMedia(constraints)
    })
  videoRef.current!.srcObject = mediaStream
  logger.log(`添加并设置呼叫方视频流`)
  // 为 video 添加视频流
  mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream))
}
