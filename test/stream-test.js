var IRCStream = require('../irc-stream.js')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  , tester = require('stream-tester')
  , should = require('should')
  , irc = require('irc')

describe('irc stream tests', function() {

  before(function(done) {
    var outPath = path.join('test', 'output')
    fs.exists(outPath, function(exists) {
      if (exists) {
        fs.readdir(outPath, function(err, files) {
          if ( files && files.length ) {
            for (var i = 0 ; i < files.length ; i++ ) {
              fs.unlink( path.join(outPath, files[i]), function(err) {
                if ( err )
                  throw err
              }) 
            }
          }
          done()
        })
      }
      else {
        fs.mkdir(outPath, 755, function(err) {
          done()
        })
      }
    })
  })
/*
  describe('# simple stream test', function(){
    it('should pass pause-unpause stream tests', function(done){
      pauseUnpauseStream(done)
    })
  })


  describe('# simple data pipe test', function(){
    it('should pass simple objects to pubsub channel', function(done){
      simplePubsub(done)
    })
  })
*/
}) 

var pauseUnpauseStream = function (done) {
  var opts = { channel:"pauseUnpauseStreamTest"      //name of the channel to publish messages
      , serverAddress: "localhost"  //address of irc server
      , serverPort:6667     //port of irc server
      , ircOpts: {} }
  tester.createRandomStream(10000) //10k random numbers
    .pipe(tester.createUnpauseStream())
    .pipe(new IRCStream(opts))
    .pipe(tester.createPauseStream())  
  setTimeout(function(){
    done()
  }, 1500) //need some time here so that pipelines can empty and whatnot before moving on to other tests
}

var simplePubsub = function (done) {
  // define the test data and output file
  var inFile = path.join('test', 'input', 'simpleText')
    , opts = { channel:"test"      //name of the channel to publish messages
      , serverAddress: "localhost"  //address of irc server
      , serverPort:6667     //port of irc server
      , ircOpts: {} }
    , result = []

  var rc = irc.createClient(opts.serverPort, opts.serverAddress, opts.ircOpts)
  rc.subscribe(opts.channel)
  rc.on('message', function(channel, message){
    //console.log('message!')
    result.push(JSON.parse(message))
  })

  var pubsub = new IRCStream(opts)

  fs.readFile(inFile, function (err, data) {
    if (err) throw err
    data = JSON.parse(data)
    for(var i=0; i<data.length; i++){
      pubsub.write(data[i]);
    }
    setTimeout(function(){
      result.should.eql(data)
      done()
    }, 1500) //just need some time to receive and handle the messages returning to rc obj above.
  })
 
}
