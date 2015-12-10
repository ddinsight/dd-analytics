module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    shell: {
      options : {
        stdout: true
      },
      npm_install: {
        command: 'npm install'
      },
      bower_install: {
        command: './node_modules/.bin/bower install'
      },
      font_awesome_fonts: {
        command: 'cp -R bower_components/components-font-awesome/font app/font'
      }
    },

    connect: {
      options: {
        base: 'app/'
      },
      webserver: {
        options: {
          port: 8888,
          keepalive: true
        }
      },
      devserver: {
        options: {
          port: 8888
        }
      },
      testserver: {
        options: {
          port: 9999
        }
      },
      coverage: {
        options: {
          base: 'coverage/',
          port: 5555,
          keepalive: true
        }
      }
    },

    open: {
      devserver: {
        path: 'http://localhost:8888'
      },
      coverage: {
        path: 'http://localhost:5555'
      }
    },
    karma: {
      unit: {
        configFile: './test/karma-unit.conf.js',
        autoWatch: false,
        singleRun: true
      },
      unit_auto: {
        configFile: './test/karma-unit.conf.js'
      }
    },
    watch: {
      assets: {
        files: ['app/assets/vendor/**/*.js','app/js/**/*.js'],
        tasks: ['concat']
      }
    },
    concat: {
      css: {
        src: [
          'app/assets/css/**/*.css'
        ],
        dest: 'app.css'
      }
    },

    concat: {
      scripts: {
        options: {
          separator: ';'
        },
        dest: './app/build/app.js',
        src: [
          'app/assets/vendor/underscore-min.js',
          'app/assets/vendor/angular.js',
          'app/assets/vendor/angular-route.js',
          'app/assets/vendor/angular-resource.js',
          'app/assets/vendor/angular-cookies.js',
          'app/assets/vendor/angular-loader.js',
          'app/assets/vendor/angular-sanitize.js',
          'app/assets/vendor/angular-animate.js',
          'app/assets/vendor/ui-bootstrap-tpls-0.11.2.js',
          'app/assets/vendor/codemirror.js',
          'app/assets/vendor/codemirror-mysql.js',
          'app/assets/vendor/ui-codemirror.js',
          'app/assets/vendor/angular-ui-tree.js',
          'app/assets/vendor/ng-csv.js',
          'app/assets/vendor/*hint*.js',
          'app/js/lib/router.js',
          'app/js/config/config.js',
          'app/js/services/**/*.js',
          'app/js/directives/**/*.js',
          'app/js/controllers/**/*.js',
          'app/js/filters/**/*.js',
          'app/js/config/routes.js',
          'app/js/app.js'
          
        ]
      }
    },
    cssmin: {
      css: {
        src: 'app.css', dest:'app.min.css'
      }
    }
  });


  //installation-related
  grunt.registerTask('install', ['shell:npm_install','shell:bower_install','shell:font_awesome_fonts']);

  //defaults
  grunt.registerTask('default', ['dev']);

  //development
  // grunt.registerTask('dev', ['install', 'concat', 'watch:assets']);
  grunt.registerTask('dev', ['install', 'concat','connect:devserver', 'open:devserver', 'watch:assets']);

};
