const { Framework } = require('@midwayjs/koa');
const { Bootstrap } = require('@midwayjs/bootstrap');
const SocketFramework = require('@midwayjs/socketio').Framework;

const web = new Framework().configure({
  port: 7001,
});

const socketFramework = new SocketFramework().configure({
  path: '/RTC_SOCKET_PATH'
});

Bootstrap.load(web)
  .load(socketFramework)
  .run()
  .then(() => {
    console.log('Your application is running at http://localhost:7001');
  });
