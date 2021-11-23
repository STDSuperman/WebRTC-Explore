import { RefObject } from 'react';
import { PeerConnection, EventBus } from '@/utils'
import { logger } from '@/utils/logger'
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
export const initPeer = async (
  videoRef: RefObject<HTMLVideoElement>,
  testRef: RefObject<HTMLVideoElement>
) => {
  const RTCPeer = new PeerConnection();
  logger.log('创建新 RTCPeer 实例');

  // 初始化呼叫端逻辑
  await initCallSide(RTCPeer);
  // 初始化作为被呼叫端逻辑
  await initRemoteSide(RTCPeer, testRef);

  // 初始化额外数据
  RTCPeer.customData = {};

  logger.log(`初始化 RTCPeer 完成`)

  return RTCPeer;
}

// 初始化呼叫端
export const initCallSide = async (
  RTCPeer: RTCPeerConnection
) => {
  // 呼叫方拿到 iceCandidate 后发送给远端设置 iceCandidate
  RTCPeer.addEventListener('icecandidate', event => {
    if (event.candidate) {
      logger.log(`呼叫方拿到 candidate`)
      EventBus.emit(
        EventsEnum.SET_REMOTE_ICE_CANDIDATE,
        event.candidate
      );
    }
  })

  // 呼叫方设置 iceCandidate
  EventBus.on(
    EventsEnum.SET_LOCAL_ICE_CANDIDATE,
    async (
      iceCandidate: RTCIceCandidate
    ) => {
      logger.log(`设置呼叫端 iceCandidate`)
      await RTCPeer.addIceCandidate(iceCandidate);
    }
  );

  // 呼叫方设置远端发送过来的 answer 到本地 desc
  EventBus.on(
    EventsEnum.SET_ANSWER_DESCRIPTION,
    async (answer: RTCSessionDescriptionInit) => {
      if (RTCPeer.customData.type === DESCRIPTION_SET_TYPE.REMOTE) return;
      logger.log(`呼叫方设置 answer`)
      await RTCPeer.setRemoteDescription(answer);
    }
  )
  return RTCPeer;
}

export const initRemoteSide = (
  peer: RTCPeerConnection,
  videoRef: RefObject<HTMLVideoElement>
) => {
  logger.log(`开始初始化远端监听事件`)

  // 被呼叫端拿到 icecandidate
  peer.addEventListener('icecandidate', e => {
    if (e.candidate) {
      logger.log(`呼叫方拿到 candidate`)
      EventBus.emit(
        EventsEnum.SET_LOCAL_ICE_CANDIDATE,
        e.candidate
      );
    }
  })

  // 被呼叫方设置 iceCandidate
  EventBus.on(
    EventsEnum.SET_REMOTE_ICE_CANDIDATE,
    async (iceCandidate: RTCIceCandidate) => {
      logger.log(`设置远端 iceCandidate`)
      await peer.addIceCandidate(iceCandidate);
    }
  );

  // 被呼叫方设置远端连接发送过来的 offer
  EventBus.on(
    EventsEnum.SET_OFFER_DESCRIPTION,
    async (desc: RTCSessionDescriptionInit) => {
      if (peer.customData.type === DESCRIPTION_SET_TYPE.LOCAL) return;
      logger.log(`设置远端 offer`);
      await peer.setRemoteDescription(desc);
      await handlerReplyAnswer(peer);
    }
  );

  // 被呼叫方收到流消息
  peer.addEventListener('track', e => {
    if (!videoRef.current) return;
    logger.log(`收到 track 消息`)
    videoRef.current.srcObject = e.streams[0];
  });
}

// 开始呼叫远端
export const startCall = async (
  peer: RTCPeerConnection,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  logger.log(`发起呼叫流程`)
  await createAndAddStream(peer, videoRef);
  // 首先创建 offear
  const offer = await peer.createOffer(RTC_OFFER_OPTION);
  // 设置本地 offer 描述
  await peer.setLocalDescription(offer);
  logger.log(`设置呼叫端 offer`)
  // 设置作为呼叫方设置 desc 类型
  peer.customData.type = DESCRIPTION_SET_TYPE.LOCAL;
  // 通知远端设置 offer 描述
  EventBus.emit(
    EventsEnum.SET_OFFER_DESCRIPTION,
    offer
  );
}

// 处理收到 offer 之后的答复逻辑
export const handlerReplyAnswer = async (peer: RTCPeerConnection) => {
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  peer.customData.type = DESCRIPTION_SET_TYPE.REMOTE;
  logger.log(`远端创建 answer 并推送呼叫端`)
  EventBus.emit(
    EventsEnum.SET_ANSWER_DESCRIPTION,
    answer
  )
}

export const createAndAddStream = async (
  peer: RTCPeerConnection,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  // 获取视频流
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
  videoRef.current!.srcObject = mediaStream;
  logger.log(`添加并设置呼叫方视频流`)
  // 为 video 添加视频流
  mediaStream.getTracks().forEach(track => peer.addTrack(track));
}