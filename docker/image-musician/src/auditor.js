/* eslint-disable no-console */
/*
 This program simulates a "data collection station auditor", which joins a multicast
 group in order to receive measures published by thermometers (or other sensors).
 The measures are transported in json payloads with the following format:
{"uuid":aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60,"instrument":"piano",
"activeSince":2016-04-27T05:20:50.731Z}

 Usage: to start the auditor, use the following command in a terminal

   node auditor.js

*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple
 * application-level protocol
 */
/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');
const net = require('net');
const protocol = require('./musician-protocol');
const protocolInstrument = require('./instrument-protocol');

const musicians = new Map();


function findInstrumentBySound(instrumentSound) {
  let ret;
  switch (instrumentSound) {
    case protocolInstrument.PIANO_SOUND:
      ret = protocolInstrument.PIANO;
      break;
    case protocolInstrument.TRUMPET_SOUND:
      ret = protocolInstrument.TRUMPET;
      break;
    case protocolInstrument.FLUTE_SOUND:
      ret = protocolInstrument.FLUTE;
      break;
    case protocolInstrument.VIOLIN_SOUND:
      ret = protocolInstrument.VIOLIN;
      break;
    case protocolInstrument.DRUM_SOUND:
      ret = protocolInstrument.DRUM;
      break;

    default:
      ret = protocolInstrument.UNKNOWN;
      break;
  }
  return ret;
}

function deleteMusician (uuid) {
  console.log(`Delete of musician : ${uuid}`);
  musicians.delete(uuid);
}
/*
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Joining multicast group');
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});


/*
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', (msg, source) => {
  console.log(`Data has arrived: ${msg}. Source port: ${source.port}`);
  // parse payload to JSON Object
  const musicianJSON = JSON.parse(msg);
  // recovering of used instrument
  const instrumentBySound = findInstrumentBySound(musicianJSON.sound);
  const { uuid } = musicianJSON;

  // musician is already present in the map
  if (musicians.has(uuid)) {
    const musician = musicians.get(uuid);
    clearTimeout(musician.timeOut);
    musician.timeOut = setTimeout(deleteMusician, protocol.TIMEOUT, uuid);
  } else {
    const musician = {
      instrument: instrumentBySound,
      sound: musicianJSON.sound,
      ActiveSince: Date(),
      timeOut: setTimeout(deleteMusician, protocol.TIMEOUT, uuid),
    };
    musicians.set(uuid, musician);
    console.log(`Musician n° ${uuid} is playing ${musician.instrument}`);
  }
});


net.createServer((socket) => {
  // javascript array map
  const tmp = [];
  musicians.forEach((val, key) => {
    tmp.push({
      uuid: key,
      instrument: val.instrument,
      ActiveSince: val.ActiveSince,
    });
  });

  socket.write(`${JSON.stringify(tmp)}\r\n`);

  socket.end();
}).listen(2205);
