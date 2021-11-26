import { WSController, Provide, OnWSConnection, Inject, OnWSMessage, WSEmit } from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';

@Provide()
@WSController('/')
export class HelloSocketController {
  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
  }

  @OnWSMessage('myEvent')
  @WSEmit('myEventResult')
  async gotMessage(data) {
    console.log('on data got', this.ctx.id, data);
    return {
      code: 0
    }
  }
}