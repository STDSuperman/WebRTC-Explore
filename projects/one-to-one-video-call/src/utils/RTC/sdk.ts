import { PeerConnection, getEventEmitter } from "@/utils";
import { EventEmitter } from "events";
import { getSocketInstance } from "@/utils/socket-client";
import { RTC_SOCKET_PATH } from "@/utils/constant";
import { Socket } from "socket.io-client";
import { logger } from "@/utils/logger";
import { RTC_OFFER_OPTION, EventsEnum } from "@/utils/constant";
import {
  P2PSocketEventsType,
  ICandidateInfo,
  IOfferInfo
} from './type'

export class P2PConnection {
	public socketInstance: Socket;
	public peerInstance: RTCPeerConnection;
	public eventEmitter: EventEmitter;
	constructor() {
		this.init();
	}

	init() {
		this.socketInstance = getSocketInstance(RTC_SOCKET_PATH);
		this.peerInstance = new PeerConnection();
		this.eventEmitter = getEventEmitter();
		this.socketInstance.on("connection", (e) => {
			console.log(e);
		});
	}

	async call() {
    // 创建 offer
		const offer = await this.peerInstance.createOffer(RTC_OFFER_OPTION);
		// 设置本地 offer 描述
		await this.peerInstance.setLocalDescription(offer);
		this.socketInstance.emit(P2PSocketEventsType.START_P2P_CONNECTION, offer);
	}

	bindEvents() {
		// 接收并到 answer 消息设置到本地 peer desc
		this.socketInstance.on(
			EventsEnum.SET_ANSWER_DESCRIPTION,
			async (answer: RTCSessionDescriptionInit) => {
				logger.log(`设置 answer`);
				await this.peerInstance.setRemoteDescription(answer);
			}
		);

		// 接收并设置 iceCandidate
		this.socketInstance.on(
			EventsEnum.SET_REMOTE_ICE_CANDIDATE,
			async ({ candidate }: ICandidateInfo) => {
				logger.log(`设置 iceCandidate`);
				await this.peerInstance.addIceCandidate(candidate);
			}
		);

		// 接收并设置远端连接发送过来的 offer
		this.socketInstance.on(
			EventsEnum.SET_OFFER_DESCRIPTION,
			async ({ offer }: IOfferInfo) => {
				logger.log(`设置远端 offer`);
				await this.peerInstance.setRemoteDescription(offer);
				await this.handlerReplyAnswer();
			}
		);

		// 收到流消息
		this.peerInstance.addEventListener("track", (e) => {
			this.eventEmitter.emit(P2PSocketEventsType.TRACK, e);
		});

    // p2p 连接状态更改
    this.peerInstance.addEventListener('iceconnectionstatechange', e => {
      logger.log('peer-state-change: ', this.peerInstance.iceConnectionState);
    })

    // 拿到 icecandidate 推送远端
    this.peerInstance.addEventListener('icecandidate', e => {
      if (e.candidate) {
        logger.log(`拿到 candidate`);
        this.socketInstance.emit(
          EventsEnum.SET_LOCAL_ICE_CANDIDATE,
          e.candidate
        );
      }
    })
	}

	async handlerReplyAnswer() {
		const answer = await this.peerInstance.createAnswer();
		await this.peerInstance.setLocalDescription(answer);

		logger.log(`创建 answer 并推送`);
		this.socketInstance.emit(EventsEnum.SET_ANSWER_DESCRIPTION, answer);
	}

	on(eventType: string, listener) {
		return this.eventEmitter.on(eventType, listener);
	}
}
