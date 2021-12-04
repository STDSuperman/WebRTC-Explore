// @ts-ignore: 设置 .d.ts 无效
import { Server } from 'bittorrent-tracker'
import { logger } from '@codesuperman/logger'

const app = new Server({
  udp: true, // enable udp server? [default=true]
  http: true, // enable http server? [default=true]
  ws: true, // enable websocket server? [default=true]
  stats: true, // enable web-based statistics? [default=true]
  trustProxy: false // enable trusting x-forwarded-for header for remote IP [default=false]
})


app.on('error', function (err: Error) {
  logger.log(err.message)
})

app.on('warning', function (err: Error) {
  logger.log(err.message)
})

app.on('listening', function () {
  logger.log('listening on http port:' + app.http.address().port)
  logger.log('listening on udp port:' + app.udp.address().port)
})



app.on('start', function (addr: string) {
  logger.log('got start message from ' + addr)
})

app.on('complete', function (addr: string) {
  logger.log(`complete: ${addr}`)
})
app.on('update', function (addr: string) {
  logger.log(`update: ${addr}`)
})
app.on('stop', function (addr: string) {
  logger.log(`stop: ${addr}`)
})

app.listen(5555, 'localhost');