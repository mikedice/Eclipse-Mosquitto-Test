var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1',{clientId: 'youareaboob', protocolId: 'MQIsdp', protocolVersion: 3, connectTimeout:1000, debug:true});


client.on('connect', function () {
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})