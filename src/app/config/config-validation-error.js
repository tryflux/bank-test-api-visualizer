class ConfigValidationError extends Error {
  constructor (...args) {
    super(...args)
    Error.captureStackTrace(this, ConfigValidationError)
  }
}

module.exports = {
  ConfigValidationError
}
