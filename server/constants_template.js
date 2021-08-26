function define(name, value) {
  Object.defineProperty(exports, name, {
    value: value,
    enumerable: true,
  })
}

define('ANKICARDSLOCATION', '/path/to/cards/')
define('ANKIDONECARDSLOCATION', '/path/to/done_cards/')
define('ANKICONNECTAPIENDPOINT', 'http://localhost:8765')
