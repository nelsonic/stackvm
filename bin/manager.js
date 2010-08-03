#!/usr/bin/env node
// Manage VM instances

var sys = require('sys');
var fs = require('fs');
var crypto = require('crypto');

var DNode = require('dnode');

var managers = require('../lib/managers');

var users = JSON.parse(
    fs.readFileSync(__dirname + '/../data/users.json', 'ascii')
);

DNode(function (client,conn) {
    return new Manager({
        client : client,
        connection : conn,
    });
}).listen(9077);

function Manager(params) {
    var self = this;
    var client = params.client;
    var conn = params.connection;
    
    self.spawn = function (params, f) {
        var user = params.user;
        var vm = params.vm;
        var engine = params.engine; // qemu, vmware, vbox
        
        managers[engine].spawn(user, vm, f);
    };
    
    self.kill = function (proc, f) {
        managers[proc.engine].kill(proc, f);
    };
    
    self.restart = function (proc, f) {
        self.kill(proc, function () {
            self.spawn(proc.user, proc.vm, f);
        });
    };
    
    // Authentication will get its own DNode server eventually.
    // For now:
    self.authenticate = function (name, pass, f) {
        var hash = new crypto.Hash('sha512').update(pass).digest('hex');
        var user = users[name.toLowerCase()];
        if (user && user.hash == hash) {
            delete user.hash;
            f(user);
        }
        else {
            f(null);
        }
    };
}

