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
 *  opts.channel        //name of the channel
 *  opts.serverAddress  //address of irc server
 *  opts.serverPort     //port of irc server
 *  opts.ircOpts        //special options passed to irc module.  see irc module for documentation
 *
 * @param {Object} opts The regular expression configuration. 
 *
 */
function SimpleIRCStream(opts) {
  
  // name of the application, defined in package.json, used for errors
  this._appName = require('./package').name
  this._version = require('./package').version
  this._errorPrefix = this._appName + ': '

  this.writable = true
  this.readable = true

  this._paused = this._ended = this._destroyed = false

  this._buffer = ''

  Stream.call(this)

  if (!opts)
    opts = {}
  if (!opts.serverPort)
    opts.serverPort = 6667
  if(!opts.serverAddress)
    opts.serverAddress = "localhost"
  if(opts.channel)
    this.channel = opts.channel
  else
    this.channel = "Default"
  var ircOpts = {}
  if(opts.ircOpts) ircOpts = opts.ircOpts

  this.ircClient = null//TODO //redis.createClient(opts.serverPort, opts.serverAddress, redisOpts)

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

  if(verbose){ 
    console.log('publish to redis channel: ' + this.channel + ', message: ' + util.inspect(record))
  }
  //TODO callback need to do anything?
  this.redisClient.publish(this.channel, JSON.stringify(record), function (err, res){  })
  
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
