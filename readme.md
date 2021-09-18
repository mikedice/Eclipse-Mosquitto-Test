# Experiment with Eclipse Mosquitto MQTT broker
This note documents my learnigns from experimentation with the Eclipse Mosquitto MQTT broker service. I was interested in experimenting with this service as the solution for a notification system that could be used to send notifications to devices in my home network such as the numerous Raspberry PI's I own plus a few other different types of devices. MQTT is a common IoT protocol used for such notifications and thus I was interested in learning more about the protocol and various server and client side implementations of it.

## Learnings
The environment I used was my early 2015 Macbook Air running macOS Big Sur (11.5.2)

hello

I run Mosquitto from Docker on my laptop. Docker is a nice way to isolate services and technologies so I can run them on my dev machine without polutting the machine with dependencies and requirements of something I am just playing around with and will want cleanly removed from my computer when I am done. Docker is the bomb! If you don't know about it you should learn it here: [Docker](https://www.docker.com)

So, with that being said....

I can head on over to the [Docker repository for Mosquitto container](https://hub.docker.com/_/eclipse-mosquitto/). Nice! A nice clean way to run Mosquitto on my laptop. Note though, if you read the page about the Mosquitto container it gives you some command lines you can run on your local machine. These don't work as-is. If they did, I probably would not have written this note.

What I did was create a set of directories on my Macbook that look like this:
```
~/code/mqtt/mosquitto/config
~/code/mqtt/mosquitto/data
~/code/mqtt/mosquitto/log

Create a config file here:
~/code/mqtt/mosquitto/config/mosquitto.conf

```
The contents of the mosquitto.conf file look like this:
```
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
listener 1883
allow_anonymous true
```

The conf file (mosquitto.conf) has entries to comply with access control compliance required by newer versions of the Mosquitto. In the conf file you need to specify who is allowed to access your running instance over the network. If you don't none of the client samples will work.

Refer to the docs here:
https://mosquitto.org/documentation/authentication-methods/

In my conf file I added the following lines to allow anonymous users to access my local instance of mosquitto
```
listener 1883
allow_anonymous true
```

Also notice that in the conf file the persistance_location and log_dest settings refer to the directories I created above.

With all of the above set up, you can then run the following Docker command to start Mosquitto on your local host.
```
docker run -it --rm --name mosquitto-local -p 1883:1883 -p 9001:9001 -v ~/code/mqtt/mosquitto/config/mosquitto.conf:/mosquitto/config/mosquitto.conf -v ~/code/mqtt/mosquitto/data:/mosquitto/data -v ~/code/mqtt/mosquitto/log:/mosquitto/log eclipse-mosquitto
```

A few notes about this:
* I always use --rm when running experimental containers locally. This will delete the container file after the conteiner exists. This just keeps my local hard drive cleaned up of unused files
* -it is used to run Mosquitto interactively. Because of this a simple ctrl+c in the Mosquitto console window will stop Mosquitto. Note: there are other equally as easy ways to stop a container. This is just what I use. Using -it also has the benefit of showing you any writes to the console the app you are running might be doing.
* -p port mappings: This allows other apps on my laptop to access ports exposed inside the container. The clients use port 1883. I'm not sure what 9001 is used for
* -v This is how the local host file system artifacts like log directory and conf file I mentioned above get mapped into the file system inside the container.
* The last parameter 'eclipse-mosquito' is the name of the container image that is hosted on the official Docker hub. If you don't have this on your machine Docker will download it for you before it starts running your container

I fancy using JavaScript for everything lately. So to test the Mosquitto service running on my local machine, I use the NPM package called [mqtt.js](https://www.npmjs.com/package/mqtt). This is an implementation of a client that can access Mosquitto using the mqtt protocol. I install the mqtt NPM package into a local nodejs app and then run this test script:

```
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
```

I can verify that while MQTT is running and the client is interacting with it the log and data files get created inside the directories I created in the steps above.
