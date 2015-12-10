module.exports = function(grunt) {
// <!-- <script src='../bower_components/leaflet/dist/leaflet.js'></script>
// <script src="../bower_components/leaflet.markercluster/dist/leaflet.markercluster-src.js"></script>
// <script src='../bower_components/d3-plugins/hexbin/hexbin.js'></script>
// <script src='../bower_components/leaflet-d3/dist/leaflet-d3.js'></script> -->
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options:{
          separator:';'
        },
        dist: {
          src:[// 'bower_components/d3/d3.js', 
            'bower_components/d3-plugins/hexbin/hexbin.js', 
            // 'bower_components/leaflet/dist/leaflet.js',
            'bower_components/leaflet.markercluster/dist/leaflet.markercluster-src.js',
            'bower_components/leaflet-d3/dist/leaflet-d3.js',
            'bower_components/jquery.maskedinput/dist/jquery.maskedinput.js',
            'bower_components/moment/moment.js',
            'public/assets/bootswatch.js',
            'public/assets/dark-unica.js',
            'public/assets/heatmap.js',
            'public/assets/leaflet-heatmap.js',
            'public/assets/leaflet-provider.js',
          ],
          dest:'public/assets/lib_<%= pkg.name %>.js'
        }   
    },

    uglify:{
      options:{
          banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyymmdd")%> */\n'
        },
        dist:{
          files:{
            'public/assets/lib_<%= pkg.name %>.min.js' : ['<%= concat.dist.dest %>']
          }
        }
    },
// <link rel="stylesheet" href="assets/css/bootstrap.min.css">
// <link rel="stylesheet" href="assets/css/clusterpies.css" />
// <link rel="stylesheet" href="../bower_components/leaflet/dist/leaflet.css" />
// <link rel="stylesheet" href="css/skt.css"/>
// <link rel="stylesheet" href="css/fontcustom/fontcustom.css"/>
// <link rel="stylesheet" href="../bower_components/leaflet.markercluster/dist/MarkerCluster.css" />
    cssjoin: {
      path_option:{
        files:{
          'public/assets/lib_<%= pkg.name %>.css': [
            'public/assets/css/bootstrap.min.css',             
            // 'public/assets/css/bootswatch.min.css',             
            'public/css/fontcustom/fontcustom.css',
            // 'bower_components/leaflet/dist/leaflet.css',
            'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
            'public/assets/css/clusterpies.css',
            // 'public/css/skt.css',
          ]
        }
      }
    },

    cssmin: {
      css:{
        src:['public/assets/lib_<%= pkg.name %>.css' ],
        dest:'public/assets/lib_<%= pkg.name %>.min.css'
      }
    }, 
    express: {
      options: {
        // Override defaults here 
        cmd: process.argv[0],
        opts: [ ],
        args: [ ],
        background: true,
        fallback: function() {},
        port: 3333,
        // node_env: {},
        delay: 0,
        output: ".+",
        debug:false
      },
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },
    watch: {
      express: {
        files:  [ '**/*.js' ],
        tasks:  [ 'express:dev' ],
        options: {
          spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded 
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-cssjoin');
  // grunt.registerTask('default', ['express:dev', 'watch' ,'uglify'])
  // grunt.registerTask('default', ['watch', 'concat', 'uglify', 'express:dev']);
  grunt.registerTask('default', ['concat','cssjoin', 'cssmin','uglify', 'express:dev', 'watch']);
  
  // Default task(s).
  

};
