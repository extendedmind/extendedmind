module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'electron-debian-installer': {
      options: {
        section: 'misc',
        priority: 'optional',
        arch: 'amd64',
        lintianOverrides: [
          'changelog-file-missing-in-native-package',
          'executable-not-elf-or-script',
          'extra-license-file'
        ],
        categories: [
          'Office',
          'ProjectManagement'
        ],
        rename: function (dest, src) {
          return dest + 'extended-mind-<%= version %>-linux.deb';
        },
        depends: [],
        recommends: [],
        suggests: [],
	icon: "assets/linux/icon.png"
      },
      src: {
        src: 'dist/linux/extended-mind-linux-x64',
        dest: 'dist/linux/'
      }
    }
  });
  grunt.loadNpmTasks('grunt-electron-debian-installer');
};
