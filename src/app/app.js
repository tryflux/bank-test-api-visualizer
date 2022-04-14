const { log } = require('./util/logger')
const { Config } = require('./config/config')
const { Model } = require('./model/model')
const { WebServerService } = require('./service/web-server-service')
const { FluxTokenService } = require('./service/flux-token-service')
const { populateStaticData } = require('./util/static-data')

class App {
  constructor () {
    this.config = new Config(process.env)
    this.config.isConfigValid() // this could throw and stop the application
    this.model = new Model()
    populateStaticData(this.model) // magic numbers used in the Bank Test API
    this.fluxTokenService = new FluxTokenService(this.config, this.model)
    this.webServerService = new WebServerService(this.config, this.model)
  }

  async start () {
    await this.fluxTokenService.setup()
    await this.webServerService.setup()
  }

  async stop () {
    log('info', 'beta developers test example is stopping')
    this.fluxTokenService.stop()
    this.webServerService.stop()
  }
}

module.exports = {
  App
}
