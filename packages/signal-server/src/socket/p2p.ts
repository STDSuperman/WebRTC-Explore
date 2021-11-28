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
    const targetSocket = this.findSocketById(offerInfo.targetId);
    if (targetSocket) {
      console.log(`current offer to ${targetSocket.id}`);
      this.ctx
        ?.to(targetSocket.id)
        .emit(
          SocketEventsEnum.SET_OFFER_DESCRIPTION,
          JSON.stringify({ offer: offerInfo.offer, fromId: offerInfo.fromId })
        );
    }
  }

  @OnWSMessage(SocketEventsEnum.SET_ANSWER_DESCRIPTION)
  async gotAnswerDesc(answerInfo: IAnswerInfo) {
    const targetSocket = this.findSocketById(answerInfo.targetId);
    if (targetSocket) {
      console.log(`current answer send to ${targetSocket.id}`);
      this.ctx?.to(targetSocket.id).emit(
        SocketEventsEnum.SET_ANSWER_DESCRIPTION,
        JSON.stringify({
          answer: answerInfo.answer,
          fromId: answerInfo.fromId,
        })
      );
    }
  }

  @OnWSMessage(SocketEventsEnum.SET_ICE_CANDIDATE)
  async gotCandidate(candidate: ICandidateInfo) {
    const targetSocket = this.findSocketById(candidate.targetId);
    if (targetSocket) {
      console.log(`current candidate send to ${targetSocket.id}`);
      this.ctx?.to(targetSocket.id).emit(
        SocketEventsEnum.SET_ICE_CANDIDATE,
        JSON.stringify({
          candidate: candidate.candidate,
          fromId: candidate.fromId,
        })
      );
    }
  }

  findSocketById(id: string) {
    return sockets.find(socket => socket.id === id);
  }
}
