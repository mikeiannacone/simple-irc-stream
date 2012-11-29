[![Build Status](https://travis-ci.org/ornl-situ/simple-irc-stream.png?branch=master)](https://travis-ci.org/ornl-situ/simple-irc-stream)


# Send or receive messages from an IRC server

This module will provide an input/output stream to/from IRC

This only handles basic messages, and can be used for things like piping errors from some service into some channel, or piping all messages in some channel into some other service.

## Install

npm install simple-irc-stream


## Configuration

constructor takes an opts object with the following fields:

    opts.channel        //name of the channel, with or without leading '#' (defaults to #test)
    opts.nick           //nick to use (defaults to "robot_SOMENUMBER")
    opts.serverAddress  //address of irc server (defaults to localhost)
    opts.serverPort     //port of irc server (defaults to 6667)
    opts.mode           //should be either 'readable' or 'writable' as needed
    opts.ircOpts        //special options passed to irc module.  see irc module documentation at https://node-irc.readthedocs.org/en/latest/API.html#irc.Client (and note that if channels and port fields are specified here, they will instead be overwritten with the values above)

## Usage


## Development

If you are going to do development, you may want to use the [git pre-commit hook](http://git-scm.com/book/en/Customizing-Git-Git-Hooks), which will check the `irc-stream.js` file using [jshint](https://github.com/jshint/jshint) script (if you have it installed) and run the [mocha](visionmedia.github.com/mocha/) tests (mocha is in the git repo). If either of these fail, the commit wont work. To use the hook, from project directory, run:

    ln -s ../../pre-commit.sh .git/hooks/pre-commit

# License

simple-irc-stream is freely distributable under the terms of the MIT License.

Copyright (c) Michael Iannacone (the "Original Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS, THE U.S. GOVERNMENT, OR UT-BATTELLE BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
