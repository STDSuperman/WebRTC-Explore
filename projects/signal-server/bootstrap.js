const Framework = require('@midwayjs/socketio').Framework;
const socket = new Framework().configure({
  port: 7001,
  cors: {
    origin: 'http://localhost:3000',
  }
});

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.load(socket).run();
