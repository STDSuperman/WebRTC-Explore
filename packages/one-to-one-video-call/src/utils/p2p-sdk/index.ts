import { PeerConnection, getEventEmitter } from "@/utils";
import { EventEmitter } from "events";
import { logger } from "@/utils/logger";
import { RTC_OFFER_OPTION } from "@/utils/constant";
import {
  P2PSocketEventsType,
	ICommonEventCallback,
	IBaseConfig,
	ISocketInstance
} from './type'
import {
	SocketEmitEnum,
	SocketListenEnum,
	ICandidateInfo,
	IOfferInfo,
	IConnectionInfo,
	IAnswerInfo
}  from 'p2p-types'

import * as test from 'p2p-types'

console.log(test)

export * from './type'

export class P2PConnection {
	public socketInstance: ISocketInstance;
	public peerInstance: RTCPeerConnection;
	public eventEmitter: EventEmitter;
	public baseConfig: IBaseConfig;
	private currentConnectTargetId: string;
	constructor(props: IBaseConfig) {
		this.init();
		this.baseConfig = props;
		this.checkProps();
	}

	checkProps() {
		const { socketInstance } = this.baseConfig || {};
		if (!socketInstance) throw new Error('请传入 socketInstance')
	}

	async init() {
		return new Promise((resolve, reject) => {
			this.socketInstance = this.baseConfig?.socketInstance;
			this.peerInstance = new PeerConnection();
			this.eventEmitter = getEventEmitter();
			this.bindSocketEvents();
			this.bindPeerEvents();
			this.socketInstance?.on(SocketListenEnum.ERROR, e => {
				reject(e);
			})

			this.socketInstance?.on(SocketListenEnum.CONNECTION, (
				connectionInfo: IConnectionInfo
			) => {
				this.socketInstance.id = connectionInfo.id;
				logger.log(`connected, my id is ${this.socketInstance.id}`);
				resolve(true);
			})
		})
	}

	async call(targetId: string) {
		logger.log(`start call ${targetId}, my id is ${this.socketInstance.id}`);
    // 创建 offer
		const offer = await this.peerInstance.createOffer(RTC_OFFER_OPTION);
		// 设置本地 offer 描述
		await this.peerInstance.setLocalDescription(offer);
		this.currentConnectTargetId = targetId;
		this.socketInstance?.emit(SocketEmitEnum.SET_OFFER_DESCRIPTION, {
			offer,
			fromId: this.socketInstance.id,
			targetId: this.currentConnectTargetId
		});
	}

	bindSocketEvents() {
		// 接收并到 answer 消息设置到本地 peer desc
		this.socketInstance?.on(
			SocketListenEnum.SET_ANSWER_DESCRIPTION,
			async (answerInfo: string) => {
				const { answer } = JSON.parse(answerInfo) as unknown as IAnswerInfo;
				logger.log(`设置 answer`);
				await this.peerInstance.setRemoteDescription(answer);
			}
		);

		// 接收并设置 iceCandidate
		this.socketInstance?.on(
			SocketListenEnum.SET_ICE_CANDIDATE,
			async (candidateInfo: string) => {
				const { candidate } = JSON.parse(candidateInfo) as ICandidateInfo
				logger.log(`设置 iceCandidate`);
				await this.peerInstance.addIceCandidate(candidate);
			}
		);

		// 接收并设置远端连接发送过来的 offer
		this.socketInstance?.on(
			SocketListenEnum.SET_OFFER_DESCRIPTION,
			async (offerInfo: string) => {
				const { offer, fromId } = JSON.parse(offerInfo) as unknown as IOfferInfo;
				this.currentConnectTargetId = fromId;
				logger.log(`设置远端 offer`);
				await this.peerInstance.setRemoteDescription(offer);
				await this.handlerReplyAnswer();
			}
		);
	}

	bindPeerEvents() {
		// 收到流消息
		this.peerInstance.addEventListener("track", (e) => {
			logger.log("拿到流消息")
			this.eventEmitter.emit(P2PSocketEventsType.track, e);
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
          SocketEmitEnum.SET_ICE_CANDIDATE,
          <ICandidateInfo>{
						candidate: e.candidate,
						fromId: this.socketInstance.id,
						targetId: this.currentConnectTargetId
					}
        );
      }
    })
	}

	async handlerReplyAnswer() {
		const answer = await this.peerInstance.createAnswer();
		await this.peerInstance.setLocalDescription(answer);

		logger.log(`创建 answer 并推送`);
		this.socketInstance.emit(SocketEmitEnum.SET_ANSWER_DESCRIPTION, <IAnswerInfo>{
			answer,
			fromId: this.socketInstance.id,
			targetId: this.currentConnectTargetId
		});
	}

	on(eventType: keyof typeof P2PSocketEventsType, listener: ICommonEventCallback) {
		return this.eventEmitter.on(eventType, listener);
	}
}


export const getP2PConnectionInstance = async (props: IBaseConfig) => {
	const instance = new P2PConnection(props);
	await instance.init();
	return instance;
}