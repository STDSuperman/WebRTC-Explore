import { RefObject } from 'react';
import { PeerConnection, EventBus } from '@/utils'
import {
  RTC_OFFER_OPTION,
  EventsEnum,
  DESCRIPTION_SET_TYPE
} from '@/utils/constant'

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
  // 初始化作为被呼叫端逻辑
  await initRemoteSide(RTCPeer);
  // 初始化额外数据
  RTCPeer.customData = {};

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
  // 呼叫方拿到 iceCandidate 后发送给远端设置 iceCandidate
  RTCPeer.onicecandidate = event => {
    if (event.candidate) {
      EventBus.emit(
        EventsEnum.ADD_REMOTE_ICE_CANDIDATE,
        event.candidate
      );
    }
  };
  // 呼叫方设置远端发送过来的 answer 到本地 desc
  EventBus.on(
    EventsEnum.SET_REMOTE_ANSWER_DESCRIPTION,
    async (answer: RTCSessionDescriptionInit) => {
      if (RTCPeer.customData.type === DESCRIPTION_SET_TYPE.REMOTE) return;
      await RTCPeer.setRemoteDescription(answer);
    }
  )
  return RTCPeer;
}

export const initRemoteSide = (peer: RTCPeerConnection) => {
  // 被呼叫方设置 iceCandidate
  EventBus.on(EventsEnum.ADD_REMOTE_ICE_CANDIDATE, (
    iceCandidate: RTCIceCandidate
  ) => {
    console.log(iceCandidate, peer.customData.type);
    if (peer.customData.type === DESCRIPTION_SET_TYPE.LOCAL) return;
    peer.addIceCandidate(iceCandidate);
  });
  // 被呼叫方设置远端连接发送过来的 offer
  EventBus.on(
    EventsEnum.SET_REMOTE_OFFER_DESCRIPTION,
    async (desc: RTCSessionDescriptionInit) => {
      console.log(desc, peer.customData.type);
      if (peer.customData.type === DESCRIPTION_SET_TYPE.LOCAL) return;
      await peer.setRemoteDescription(desc);
      await handlerReplyAnswer(peer);
    }
  );
}

// 开始呼叫远端
export const startCall = async (peer: RTCPeerConnection) => {
  // 首先创建 offer
  const offer = await peer.createOffer(RTC_OFFER_OPTION);
  // 设置本地 offer 描述
  await peer.setLocalDescription(offer);
  // 设置作为呼叫方设置 desc 类型
  peer.customData.type = DESCRIPTION_SET_TYPE.LOCAL;
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
  peer.customData.type = DESCRIPTION_SET_TYPE.REMOTE;
  EventBus.emit(
    EventsEnum.SET_REMOTE_ANSWER_DESCRIPTION,
    answer
  )
}