module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      options: {
        livereload: true
      },
      express: {
        files:  [ '*.js','routes/*.js', 'models/*.js', 'config/*.js', 'api/*.js', 'common/*.js' ],
        tasks:  [ 'express:dev' ],
        options: {
          spawn: false // Without this option specified express won't be reloaded
        }
      }
    },
    express: {
      options: {
        port: 3000,
        node_env: 'development'
      },
      dev: {
        options: {
          script: 'app.js',
          node_env: 'development'
        }
      },
      prod: {
        options: {
          script: 'app.js',
          node_env: 'production'
        }
      },
      debug: {
        options: {
          cmd: 'node-debug',
          script: 'app.js',
          node_env: 'development'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:' + grunt.config.get('express.options.port')
      }
    }
  });

  grunt.registerTask('test', 'mochaTest');

  grunt.registerTask('serve', function(arg) {
    if(arg && arg == 'prod') {
      grunt.task.run([
        'express:prod',
        'watch'
      ]);
    }
    if(arg && arg == 'debug') {
      grunt.task.run([
        'express:debug',
        'watch'
      ]);
    }
    else {
      grunt.task.run([
        'express:dev',
        'open',
        'watch'
      ]);
    }
  });
  grunt.registerTask('default', [ 'serve' ]);
  grunt.registerTask('dist', [ 'serve:prod' ]);

};
