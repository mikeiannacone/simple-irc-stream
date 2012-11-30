var SimpleIRCStream = require('../irc-stream.js')
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

*/
  describe('# simple data pipe test', function(){
    it('should pass simple messages to irc channel', function(done){
      sendSomeText(done)
    })
  })

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

var sendSomeText = function (done) {
  // define the test data and output file
  var inFile = path.join('test', 'input', 'simpleText')
    , readOpts = { channel:"test"      //name of the channel to publish messages
      , serverAddress: "localhost"  //address of irc server
      , serverPort:6667     //port of irc server
      , mode: 'readable'
      , nick: 'read_test_bot'
      , ircOpts: {} }
    , writeOpts = { channel:"test"      //name of the channel to publish messages
      , serverAddress: "localhost"  //address of irc server
      , serverPort:6667     //port of irc server
      , mode: 'writable'
      , nick: 'write_test_bot'
      , ircOpts: {} }
    , result = []

  var testClientListen = new SimpleIRCStream(readOpts)

  testClientListen.on('message', function(message){
    console.log('message! ' + message)
    result.push(JSON.parse(message))
  })

  var testClient = new SimpleIRCStream(writeOpts)

  setTimeout(function(){
    fs.readFile(inFile, function (err, data) {
      if (err) throw err
      data = ''+data //force to string
      data = data.split('\n')
      if(data[data.length-1] === "")
        data.pop(data.length-1) //remove last item if blank.
      for(var i=0; i<(data.length); i++){
        testClient.write(data[i]);
      }
      setTimeout(function(){
        result.should.eql(data)
        done()
      }, 1500) //just need some time to receive and handle the messages returning to rc obj above.
    })
  }, 100) //allow time to make connection //TODO should really handle that internally, with a buffer, yeah?
 
}
