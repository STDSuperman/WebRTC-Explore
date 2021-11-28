import {
  WSController,
  OnWSMessage,
  Provide,
  OnWSConnection,
  Inject,
  WSEmit,
} from '@midwayjs/decorator';
import type { Context } from '@midwayjs/socketio';
import {
  SocketEventsEnum,
  IOfferInfo,
  IAnswerInfo,
  ICandidateInfo,
} from 'p2p-types';

const sockets: Context[] = [];

@Provide()
@WSController('/')
export class P2PSocketController {
  @Inject()
  ctx: Context;

  @OnWSConnection()
  @WSEmit(SocketEventsEnum.CONNECTION)
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
    sockets.push(this.ctx);
    return {
      id: this.ctx.id,
    };
  }

  @OnWSMessage(SocketEventsEnum.SET_OFFER_DESCRIPTION)
  async gotOfferDesc(offerInfo: IOfferInfo) {
    return this.findAndSendMsg(
      offerInfo.targetId,
      SocketEventsEnum.SET_OFFER_DESCRIPTION,
      { offer: offerInfo.offer, fromId: offerInfo.fromId }
    );
  }

  @OnWSMessage(SocketEventsEnum.SET_ANSWER_DESCRIPTION)
  async gotAnswerDesc(answerInfo: IAnswerInfo) {
    return this.findAndSendMsg(
      answerInfo.targetId,
      SocketEventsEnum.SET_ANSWER_DESCRIPTION,
      {
        answer: answerInfo.answer,
        fromId: answerInfo.fromId,
      }
    );
  }

  @OnWSMessage(SocketEventsEnum.SET_ICE_CANDIDATE)
  async gotCandidate(candidate: ICandidateInfo) {
    return this.findAndSendMsg(
      candidate.targetId,
      SocketEventsEnum.SET_ICE_CANDIDATE,
      {
        candidate: candidate.candidate,
        fromId: candidate.fromId,
      }
    );
  }

  async findAndSendMsg(
    targetId: string,
    eventType: string,
    data: unknown
  ): Promise<void> {
    const targetSocket = this.findSocketById(targetId);
    if (targetSocket) {
      console.log(`send to ${targetSocket.id}`);
      this.ctx?.to(targetSocket.id).emit(eventType, JSON.stringify(data));
    }
  }

  findSocketById(id: string) {
    return sockets.find(socket => socket.id === id);
  }
}
