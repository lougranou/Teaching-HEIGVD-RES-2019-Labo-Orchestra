/* eslint-disable no-console */
/*
 This program simulates a "smart" musician, which publishes the measured instrument
 on a multicast group. Other programs can join the group and receive the measures. The
 measures are transported in json payloads with the following format:

   {"timestamp":1394656712850,"uuid":"kitchen","instrument":22.5}

 Usage: to start a musician, type the following command in a terminal
        (of course, you can run several musicians in parallel and observe that all
        measures are transmitted via the multicast group):

   node musician.js uuid instrument activeSince

*/

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');
const protocol = require('./musician-protocol');
const protocolInstrument = require('./instrument-protocol');

function correspondingSound(instrument) {
  let ret = '';
  switch (instrument) {
    case protocolInstrument.PIANO:
      ret = protocolInstrument.PIANO_SOUND;
      break;
    case protocolInstrument.TRUMPET:
      ret = protocolInstrument.TRUMPET_SOUND;
      break;
    case protocolInstrument.FLUTE:
      ret = protocolInstrument.FLUTE_SOUND;
      break;
    case protocolInstrument.VIOLIN:
      ret = protocolInstrument.VIOLIN_SOUND;
      break;
    case protocolInstrument.DRUM:
      ret = protocolInstrument.DRUM_SOUND;
      break;

    default:
      ret = protocolInstrument.UNKNOWN_SOUND;
      break;
  }
  return ret;
}

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
const s = dgram.createSocket('udp4');

/*
 * Let's define a javascript class for our Musician. The constructor accepts an instrument
 * autodetermind its uuid
 * at every iteration
 */
function Musician(instrumentName) {
  this.instrumentName = instrumentName;
  this.instrumentSound = correspondingSound(this.instrumentName);

  /*
   * We will simulate instrument changes on a regular basis. That is something that
   * we implement in a class method (via the prototype)
   */
  // eslint-disable-next-line func-names
  Musician.prototype.update = function () {
  /*
  * Let's create the measure as a dynamic javascript object, 
  * add the 2 properties (uuid and instrument), auditor will handle activeSince
  * and serialize the object to a JSON string
  */
    const sound = this.instrumentSound;
    const payload = JSON.stringify(sound);

    /*
* Finally, let's encapsulate the payload in a UDP datagram, which we publish on
* the multicast address. All subscribers to this address will receive the message.
*/
    const message = Buffer.from(payload);
    s.send(message, 0, message.length, protocol.PROTOCOL_PORT,
      protocol.PROTOCOL_MULTICAST_ADDRESS, () => {
        console.log(`Sending payload: ${payload} via port ${s.address().port}`);
      });
  };

  /*
* Let's take and send a measure every 500 ms
*/
  setInterval(this.update.bind(this), 500);
}

/*
 * Let's get the musician properties from the command line attributes
 * Some error handling wouln't hurt here...
 */
const instrument = process.argv[2];

/*
 * Let's create a new thermoter - the regular publication of measures will
 * be initiated within the constructor
 */
// eslint-disable-next-line no-unused-vars
const t1 = new Musician(instrument);
