import {
  WSController,
  OnWSMessage,
  Provide,
  OnWSConnection,
  Inject,
  WSEmit,
} from '@midwayjs/decorator';
import type { Context } from '@midwayjs/socketio';

export const enum EventsEnum {
  SET_OFFER_DESCRIPTION = 'SET_OFFER_DESCRIPTION',
  SET_ANSWER_DESCRIPTION = 'SET_ANSWER_DESCRIPTION',
  SET_REMOTE_ICE_CANDIDATE = 'SET_REMOTE_ICE_CANDIDATE'
}

@Provide()
@WSController('/p2p')
export class HelloSocketController {
  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
  }

  @OnWSMessage(EventsEnum.SET_OFFER_DESCRIPTION)
  @WSEmit(EventsEnum.SET_OFFER_DESCRIPTION)
  async gotMessage(data1, data2, data3) {
    return {
      name: 'harry',
      result: data1 + data2 + data3,
    };
  }
}
