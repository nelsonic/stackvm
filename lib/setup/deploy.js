var spawn = require('child_process').spawn;
var sys = require('sys');
var Hash = require('traverse/hash');
var Step = require('step');

var Config = require('./config.js');
var mkdirP = require('./mkdir_p');

module.exports = function (opts) {
    var self = this;
    var dirs = [ 'users', 'data' ];
    var cb = opts.done;
    
    Step(
        function () { self.hasQemu(this) },
        function (hasQemu) { 
            if (!hasQemu && opts.qemu != false) {
                cb('Qemu not detected in $PATH with `which qemu`. '
                    + ' If you still want to install, specify --no-qemu');
            }
            else {
                mkdirP(opts.base + '/users', 0700, this.parallel());
                mkdirP(opts.base + '/data', 0700, this.parallel());
            }
        },
        function (err) {
            if (err) { cb(err); return }
            Config(function (err, config) {
                if (err) { cb(err); return }
                config.local
                    .update(function (data) { data[opts.name] = opts.base })
                    .on('update', cb.bind({}, null))
                ;
            })
        }
    );
};

function hasQemu (cb) {
    var which = spawn('which', ['qemu']);
    which.on('exit', function (code) {
        cb(code == 0);
    });
};