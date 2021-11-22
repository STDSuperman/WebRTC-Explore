import { RefObject } from 'react';
import { PeerConnection, EventBus } from '@/utils'
import { RTC_OFFER_OPTION, EventsEnum } from '@/utils/constant'

export interface IPeerConnectionWithMediaStream {
  RTCPeer: RTCPeerConnection;
  mediaStream: MediaStream
}

// 初始化 RTC
export const initPeer = async (videoRef: RefObject<HTMLVideoElement>) => {
  // 拉取流
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
  videoRef.current!.srcObject = mediaStream;

  // 初始化呼叫端逻辑
  const RTCPeer = await initCallSide(mediaStream);

  return {
    RTCPeer,
    mediaStream
  }
}

// 初始化呼叫端
export const initCallSide = async (mediaStream: MediaStream) => {
  const RTCPeer = new PeerConnection();
  // 为 video 添加视频流
  mediaStream.getTracks().forEach(track => RTCPeer.addTrack(track));
  // 拿到 iceCandidate 后发送给远端设置 iceCandidate
  RTCPeer.onicecandidate = event => {
    if (event.candidate) {
      EventBus.emit(
        EventsEnum.ADD_REMOTE_ICE_CANDIDATE,
        event.candidate
      );
    }
  };
  // 设置远端连接发送过来的 offer
  EventBus.on(
    EventsEnum.SET_REMOTE_OFFER_DESCRIPTION,
    async (desc: RTCSessionDescriptionInit) => {
      await RTCPeer.setRemoteDescription(desc);
      await handlerReplyAnswer(RTCPeer);
    }
  );
  // 设置远端发送过来的 answer
  EventBus.on(
    EventsEnum.SET_REMOTE_ANSWER_DESCRIPTION,
    async (answer: RTCSessionDescriptionInit) => {
      await RTCPeer.setRemoteDescription(answer);
    }
  )
  return RTCPeer;
}

// 开始呼叫远端
export const startCall = async (peer: RTCPeerConnection) => {
  // 首先创建 offer
  const offer = await peer.createOffer(RTC_OFFER_OPTION);
  // 设置本地 offer 描述
  await peer.setLocalDescription(offer);
  // 通知远端设置 offer 描述
  EventBus.emit(
    EventsEnum.SET_REMOTE_OFFER_DESCRIPTION,
    offer
  );
}

// 处理收到 offer 之后的答复逻辑
export const handlerReplyAnswer = async (peer: RTCPeerConnection) => {
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  EventBus.emit(
    EventsEnum.SET_REMOTE_ANSWER_DESCRIPTION,
    answer
  )
}