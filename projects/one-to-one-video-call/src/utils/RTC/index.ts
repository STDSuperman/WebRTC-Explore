import { RefObject } from 'react';
import { PeerConnection, getEventEmitter } from '@/utils'
import { logger } from '@/utils/logger'
import { getPeer, setPeer, getUniId } from './store'
import {
  RTC_OFFER_OPTION,
  EventsEnum
} from '@/utils/constant'

export interface IPeerConnectionWithMediaStream {
  RTCPeer: RTCPeerConnection;
  mediaStream: MediaStream
}

export interface ICandidateInfo {
  candidate: RTCIceCandidate;
  fromPeer: RTCPeerConnection;
}

export interface IOfferInfo {
  offer: RTCSessionDescriptionInit;
  fromPeer: RTCPeerConnection
}

// 初始化 RTC
export const initPeer = async (
  videoRef: RefObject<HTMLVideoElement>
) => {
  const RTCPeer = new PeerConnection();
  logger.log('创建新 RTCPeer 实例');

  // 保存当前 peer 实例
  RTCPeer.id = getUniId();
  setPeer(RTCPeer.id, RTCPeer)
  // 添加事件中心
  RTCPeer.eventEmitter = getEventEmitter();

  // 初始化呼叫端逻辑
  await initCallSide(RTCPeer);
  // 初始化作为被呼叫端逻辑
  await initRemoteSide(RTCPeer, videoRef);

  logger.log(`初始化 RTCPeer 完成`)

  return RTCPeer;
}

// 初始化呼叫端
export const initCallSide = async (
  RTCPeer: RTCPeerConnection
) => {
  // 呼叫方设置 iceCandidate
  RTCPeer.eventEmitter.on(
    EventsEnum.SET_LOCAL_ICE_CANDIDATE,
    async (
      { candidate }: ICandidateInfo
    ) => {
      logger.log(`设置呼叫端 iceCandidate`)
      await RTCPeer.addIceCandidate(candidate);
    }
  );

  // 呼叫方设置远端发送过来的 answer 到本地 desc
  RTCPeer.eventEmitter.on(
    EventsEnum.SET_ANSWER_DESCRIPTION,
    async (answer: RTCSessionDescriptionInit) => {
      logger.log(`呼叫方设置 answer`)
      await RTCPeer.setRemoteDescription(answer);
    }
  )
  return RTCPeer;
}

// 初始化被呼叫端
export const initRemoteSide = (
  peer: RTCPeerConnection,
  videoRef: RefObject<HTMLVideoElement>
) => {
  logger.log(`开始初始化远端监听事件`)

  // 被呼叫方设置 iceCandidate
  peer.eventEmitter.on(
    EventsEnum.SET_REMOTE_ICE_CANDIDATE,
    ({ candidate }: ICandidateInfo) => {
      logger.log(`设置远端 iceCandidate`)
      peer.addIceCandidate(candidate);
    }
  );

  // 被呼叫方设置远端连接发送过来的 offer
  peer.eventEmitter.on(
    EventsEnum.SET_OFFER_DESCRIPTION,
    async ({ offer, fromPeer }: IOfferInfo) => {
      logger.log(`设置远端 offer`);
      await peer.setRemoteDescription(offer);
      await handlerReplyAnswer(peer, fromPeer);
    }
  );

  // 被呼叫方收到流消息
  peer.addEventListener('track', e => {
    if (!videoRef.current) return;
    logger.log(`被呼方收到 track 消息`)
    if (videoRef.current.srcObject !== e.streams[0]) {
      videoRef.current.srcObject = e.streams[0];
      console.log('pc2 received remote stream');
    }
  });
}

// 绑定呼叫端事件
const bindCallSideEvents = (
  peer: RTCPeerConnection,
  targetPeer: RTCPeerConnection
) => {
  peer.addEventListener('iceconnectionstatechange', e => {
    logger.log('peer', peer.iceConnectionState);
  })
  // 呼叫方拿到 iceCandidate 后发送给远端设置 iceCandidate
  peer.addEventListener('icecandidate', event => {
    if (event.candidate) {
      logger.log(`呼叫方拿到 candidate`)
      targetPeer.eventEmitter.emit(
        EventsEnum.SET_REMOTE_ICE_CANDIDATE,
        {
          candidate: event.candidate,
          fromPeer: peer
        }
      );
    }
  })
}

// 绑定被呼叫端事件
const bindReceivedSideEvents = (
  offer: RTCSessionDescriptionInit,
  peer: RTCPeerConnection,
  targetPeer: RTCPeerConnection
) => {
  // 通知远端设置 offer 描述
  targetPeer.eventEmitter.emit(
    EventsEnum.SET_OFFER_DESCRIPTION,
    {
      offer,
      fromPeer: peer
    }
  );

  targetPeer.addEventListener('iceconnectionstatechange', e => {
    logger.log('targetPeer', targetPeer.iceConnectionState);
  })

  // 被呼叫端拿到 icecandidate
  targetPeer.addEventListener('icecandidate', e => {
    if (e.candidate) {
      logger.log(`被呼叫方拿到 candidate`);
      peer.eventEmitter.emit(
        EventsEnum.SET_LOCAL_ICE_CANDIDATE,
        {
          candidate: e.candidate,
          fromPeer: targetPeer
        }
      );
    }
  })
}

// 开始呼叫远端
export const startCall = async (
  peer: RTCPeerConnection,
  targetId: string,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  if (!targetId) return;

  logger.log(`发起呼叫流程`);
  await createAndAddStream( peer, videoRef);
  // 首先创建 offer
  const offer = await peer.createOffer(RTC_OFFER_OPTION);
  // 设置本地 offer 描述
  await peer.setLocalDescription(offer);
  logger.log(`设置呼叫端 offer`);

  const targetPeer = getPeer(targetId);

  // 绑定相关事件
  bindReceivedSideEvents(offer, peer, targetPeer);
  bindCallSideEvents(peer, targetPeer);
}

// 处理收到 offer 之后的答复逻辑
export const handlerReplyAnswer = async (
  peer: RTCPeerConnection,
  fromPeer: RTCPeerConnection
) => {
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  logger.log(`远端创建 answer 并推送呼叫端`)
  fromPeer.eventEmitter.emit(
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
  mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));
}