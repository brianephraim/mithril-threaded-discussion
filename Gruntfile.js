module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    connect: {
      server: {
        options: {
          keepalive:true,
          port: 8000,
          base: {
            path: 'app',
            // options: {
            //   index: 'somedoc.html',
            //   maxAge: 300000
            // }
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['jshint']);

};