module.exports = function(grunt) {

  grunt.initConfig({
    sass: {
        options: {
            sourceMap: true
        },
        dist: {
            files: {
                './app/css/sass-generated.css': './app/sass/app.scss'
            }
        }
    },
    libsass: {
        myTarget:{
            src: './app/sass/app.scss',
            dest: './app/css/sass-generated.css',
        }
    },
    watch: {
      css: {
        files: './app/sass/app.scss',
        tasks: ['sass'],
        // options: {
        //   livereload: true,
        // },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('default', ['jshint']);

};