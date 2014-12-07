/*

Authored by: Doug Smith <info@laboratoryb.org>
---------------------------------------
A tool to automatically build dynamically load balance asterisk hosts with coreos & etc.
Part of a High Availability setup with Asterisk under coreOS & docker.
Works in both "dispatcher" mode, which sits next to a Kamailio box and watches for Asterisk to announce itself.
And in "announce" mode where it announces to Kamailio that it's available (and pulses heartbeats to it)

You can always get help with:

    node app.js --help

Run an dispatcher like:

    node app.js --etcdhost 192.168.1.1 --timeout 25000

Run an announcer like:

    node app.js --announce --etcdhost 192.168.1.1 --timeout 5500

*/

	var opts = require("nomnom")
		// --------------------------------------- Global options.
		.option('etcdhost', {
			abbr: 'e',
			default: '127.0.0.1',
			help: 'Set etcd host or ip address'
		})
		// --------------------------------------- Dispatcher options.
		.option('timeout', {
			abbr: 't',
			default: 20000,
			help: 'Timeout before heartbeat pulse check fails (in milliseconds)'
		})
		.option('listpath', {
			abbr: 'l',
			default: "/etc/kamailio/dispatcher.list",
			help: 'Path of the dispatcher.list file [dispatcher mode only]'
		})
		// --------------------------------------- Announcer options.
		.option('announce', {
			abbr: 'a',
			flag: true,
			help: 'Start in "announce" mode (defaults to dispatcher mode)'
		})
		.option('announceip', {
			abbr: 'i',
			default: "127.0.0.1",
			help: 'IP Address to announce [announce mode only]'
		})
		.option('announceport', {
			abbr: 'i',
			default: '5060',
			help: 'Port to announce [announce mode only]'
		})
		.option('weight', {
			abbr: 'i',
			default: false,
			help: 'Percentage of calls to distribute to this node [announce mode only]'
		})
		.option('heartbeat', {
			abbr: 'h',
			default: 5000,
			help: 'Time between heartbeat pulses [announce mode only] (in milliseconds)'
		})
		.parse();

	
	// Create a log object.
	var Log = require('./Log.js');
	var log = new Log();

	// Ok, let's load this next module based on announce/dispatch mode.

	if (opts.announce) {

		// Instantiate our main app.
		var Announcer = require('./Announcer.js');
		var announcer = new Announcer(log,opts);

	} else {

		// Create the Kamailio object (which writes dispatcher.list files)
		var Kamailio = require('./Kamailio.js');
		var kamailio = new Kamailio(log,opts);

		// Instantiate our main app.
		var Dispatcher = require('./Dispatcher.js');
		var dispatcher = new Dispatcher(log,opts,kamailio);	

	}