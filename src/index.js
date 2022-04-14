const { App } = require('./app/app.js')
const { log } = require('./app/util/logger')

let app = null

const gracefulExit = () => {
  log('info', 'Application closing...')
  if (app) {
    app.stop()
  }
  process.exit()
}

process.on('uncaughtException', (error) => {
  log('error', error.message, error)
  log(
    'error',
    'Uncaught Exception. Application attempting graceful shut down',
    error
  )
  gracefulExit()
})

process.on('unhandledRejection', (reason, promise) => {
  log(
    'error',
    'Unhandled Rejection. Application continuing...',
    reason,
    promise
  )
  gracefulExit()
})

process.on('SIGINT', function () {
  gracefulExit()
})
process.on('SIGTERM', () => {
  gracefulExit()
})

log('info', 'Application starting...')
app = new App()
app.start()
