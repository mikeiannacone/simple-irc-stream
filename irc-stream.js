/*
 *
 * # simple-irc-stream
 *
 *
 */

 /*jshint node:true, indent:2, globalstrict: true, asi: true, laxcomma: true, laxbreak: true */
 /*global module:true, require:true, console:true, process:true */

'use strict';

module.exports = SimpleIRCStream

var Stream = require('stream').Stream
  , util = require('util')
  , irc = require('irc')


/**
 *
 * Constructor is a single global object
 *
 * Available properties for configuration object: 
 *
 *  opts.channel        //name of the channel, with or without leading '#' (defaults to #test)
 *  opts.nick           //nick to use (defaults to "robot_SOMENUMBER")
 *  opts.serverAddress  //address of irc server (defaults to localhost)
 *  opts.serverPort     //port of irc server (defaults to 6667)
 *  opts.mode           //should be either 'readable' or 'writable' as needed
 *  opts.ircOpts        //special options passed to irc module.  see irc module documentation at https://node-irc.readthedocs.org/en/latest/API.html#irc.Client (and note that if channels and port fields are specified here, they will instead be overwritten with the values above)
 *
 * @param {Object} opts The regular expression configuration. 
 *
 */
function SimpleIRCStream(opts) {

  this.verbose = false;
  
  // name of the application, defined in package.json, used for errors
  this._appName = require('./package').name
  this._version = require('./package').version
  this._errorPrefix = this._appName + ': '

  this._paused = this._ended = this._destroyed = false

  this._buffer = ''

  Stream.call(this)

  if (!opts)
    opts = {}

  if (!opts.serverPort)
    opts.serverPort = 6667
  this.serverPort = opts.serverPort

  if(!opts.serverAddress)
    opts.serverAddress = "localhost"
  this.serverAddress = opts.serverAddress

  if(opts.channel)
    this.channel = opts.channel
  else
    this.channel = "test"
  //prepend with # if needed
  if(this.channel[0] !== '#')
    this.channel = '#' + this.channel

  if(opts.nick)
    this.nick = opts.nick
  else{
    var botNum = Math.floor((Math.random()*10000))
    this.nick = "robot_" + botNum
  }

  if(opts.mode && opts.mode.toLowerCase() === 'readable'){
    this._mode = 'readable'
    this.writable = false
    this.readable = true
  }else if(opts.mode && opts.mode.toLowerCase() === 'writable'){
    this._mode = 'writable'
    this.writable = true
    this.readable = false
  }else{ //TODO how best to handle?  There's probably a better way.
    this.writable = false
    this.readable = false
    console.log("ERROR: mode must be readable or writable")
    return null
  }

  this.ircOpts = {}
  if(opts.ircOpts)
    this.ircOpts = opts.ircOpts

  this.ircOpts.channels = [this.channel] //not working for some reason? will join() instead.
  this.ircOpts.port = this.serverPort

  //actually connect now
  this.ircClient = new irc.Client(this.serverAddress, this.nick, this.ircOpts);

  var self = this;
  this.ircClient.addListener('registered', function(){
    //now that you have your connection, you can do your other needed stuff.
    self.ircClient.join(self.channel)
  })

  //set up the listner, will emit events here if desired.
  if(this._mode === 'readable'){
    this.ircClient.addListener('message'+this.channel, function (from, message) { //TODO replace with a useful listener
      console.log(from + ' => ' + this.channel + ': ' + message);
    })
  }

  //set up a listener for errors (from the server, etc)
  this.ircClient.addListener('error', function(message) {
    console.log('error: ', message);//TODO better handling
  })

  return this
}

// inherit from [Stream](http://nodejs.org/docs/latest/api/stream.html)
util.inherits(SimpleIRCStream, Stream)


/**
 *
 * Parse a chunk and emit the parsed data. Implements writable stream method [stream.write(string)](http://nodejs.org/docs/latest/api/stream.html#stream_stream_write_string_encoding)
 * Assumes UTF-8
 * 
 * @param {String} data to write to stream (assumes UTF-8)
 * @return {boolean} true if written, false if it will be sent later
 *
 */
SimpleIRCStream.prototype.write = function (data) {
  // cannot write to a stream after it has ended
  if ( this._ended ) 
    throw new Error('SimpleIRCStream: write after end')

  if ( ! this.writable ) 
    throw new Error('SimpleIRCStream: not a writable stream')
  
  if ( this._paused ) 
    return false

  if(this.verbose){ 
    console.log('saying to channel: ' + this.channel + ', message: ' + util.inspect(data))
  }

  this.ircClient.say(this.channel, JSON.stringify(data)); //TODO only stringify when needed.
  
  return true  
}

/*
 *
 * Write optional parameter and terminate the stream, allowing queued write data to be sent before closing the stream. Implements writable stream method [stream.end(string)](http://nodejs.org/docs/latest/api/stream.html#stream_stream_end)
 *
 * @param {String} data The data to write to stream (assumes UTF-8)
 *
 */
SimpleIRCStream.prototype.end = function (str) {
  if ( this._ended ) return
  
  if ( ! this.writable ) return
  
  if ( arguments.length )
    this.write(str)
  
  this._ended = true
  this.readable = false
  this.writable = false

  this.emit('end')
  this.emit('close')
}

/*
 *
 * Pause the stream. Implements readable stream method [stream.pause()](http://nodejs.org/docs/latest/api/stream.html#stream_stream_pause)
 *
 */
SimpleIRCStream.prototype.pause = function () {
  if ( this._paused ) return
  
  this._paused = true
  this.emit('pause')
}

/*
 *
 * Resume stream after a pause, emitting a drain. Implements readable stream method [stream.resume()](http://nodejs.org/docs/latest/api/stream.html#stream_stream_resume)
 *
 */
SimpleIRCStream.prototype.resume = function () {
  if ( this._paused ) {
    this._paused = false
    this.emit('drain')
  }
}


/*
 *
 * Destroy the stream. Stream is no longer writable nor readable. Implements writable stream method [stream.destroy()](http://nodejs.org/docs/latest/api/stream.html#stream_stream_destroy_1)
 *
 */
SimpleIRCStream.prototype.destroy = function () {
  if ( this._destroyed ) return
  
  this._destroyed = true
  this._ended = true

  this.readable = false
  this.writable = false

  this.emit('end')
  this.emit('close')
}

SimpleIRCStream.prototype.flush = function () {
  this.emit('flush')
}
