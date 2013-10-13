
const EXEC = require("child_process").exec;


module.exports.overlays = {
    name: "redis",
    defaultConfig: {
        "port": null
    },
    toStandardConfig: function(config) {
        return {
            "io": {
                "port": (config && config.port) || null
            }
        };
    },
    fromStandardConfig: function(config) {
        return {
            "port": config.io.port
        };
    },
    getLaunchScript: function($pinf, config, options) {
        // @see http://redis.io/topics/config
        // @see https://raw.github.com/antirez/redis/2.6/redis.conf
        var args = [
            "redis-server",
            "--port", config.port
        ];
        args = args.concat([
            ">", options.stdoutPath,
            "2>", options.stderrPath
        ]);
        return [
            "#!/bin/sh",
            args.join(" ")
        ].join("\n");
    },
    isRunning: function($pinf, config, callback) {
        return EXEC([
            "redis-cli",
            "-p", config.port,
            "ping"
        ].join(" "), function (err, stdout, stderr) {
            if (err) {
                if (/Connection refused/.test(err.message)) return callback(null, false);
                return callback(err);
            }
            return callback(null, (stdout === "PONG\n"));
        });
    }
};

require("pinf-io-daemonize/io").forModule(module, module.exports.overlays);
