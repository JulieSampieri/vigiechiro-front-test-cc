// Generated by CoffeeScript 1.12.7
(function() {
  "use strict";
  module.exports = function(grunt) {
    var appConfig;
    require("load-grunt-tasks")(grunt);
    require("time-grunt")(grunt);
    appConfig = {
      app: require("./bower.json").appPath || "app",
      dist: "dist"
    };
    grunt.loadNpmTasks("grunt-protractor-runner");
    grunt.initConfig({
      yeoman: appConfig,
      watch: {
        bower: {
          files: ["bower.json"],
          tasks: ["wiredep"]
        },
        coffee: {
          files: ["<%= yeoman.app %>/scripts/**/*.{coffee,litcoffee,coffee.md}"],
          tasks: ["newer:coffee:dist"]
        },
        coffeeTest: {
          files: ["test/**/*.{coffee,litcoffee,coffee.md}"],
          tasks: ["newer:coffee:test", "karma"]
        },
        styles: {
          files: ["<%= yeoman.app %>/styles/**/*.css"],
          tasks: ["newer:copy:styles", "postcss"]
        },
        gruntfile: {
          files: ["Gruntfile.js"]
        },
        livereload: {
          options: {
            livereload: "<%= connect.options.livereload %>"
          },
          files: ["<%= yeoman.app %>/**/*.html", ".tmp/styles/**/*.css", ".tmp/scripts/**/*.js", "<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}"]
        }
      },
      connect: {
        options: {
          port: 9000,
          hostname: "localhost",
          livereload: 35729
        },
        livereload: {
          options: {
            open: true,
            middleware: function(connect) {
              return [connect["static"](".tmp"), connect().use("/bower_components", connect["static"]("./bower_components")), connect["static"](appConfig.app)];
            }
          }
        },
        test: {
          options: {
            port: 9001,
            middleware: function(connect) {
              return [connect["static"](".tmp"), connect["static"]("test"), connect().use("/bower_components", connect["static"]("./bower_components")), connect["static"](appConfig.app)];
            }
          }
        },
        dist: {
          options: {
            open: true,
            base: "<%= yeoman.dist %>"
          }
        }
      },
      clean: {
        dist: {
          files: [
            {
              dot: true,
              src: [".tmp", "<%= yeoman.dist %>/**/*", "!<%= yeoman.dist %>/.git*"]
            }
          ]
        },
        server: ".tmp"
      },
      postcss: {
        options: {
          processors: [
            require('autoprefixer')({
              browsers: ["last 1 version"]
            })
          ]
        },
        dist: {
          files: [
            {
              expand: true,
              cwd: ".tmp/styles/",
              src: "**/*.css",
              dest: ".tmp/styles/"
            }
          ]
        }
      },
      wiredep: {
        app: {
          src: ["<%= yeoman.app %>/index.html"],
          ignorePath: /\.\.\//
        }
      },
      coffee: {
        options: {
          sourceMap: true,
          sourceRoot: ""
        },
        dist: {
          files: [
            {
              expand: true,
              cwd: "<%= yeoman.app %>/scripts",
              src: "**/*.coffee",
              dest: ".tmp/scripts",
              ext: ".js"
            }
          ]
        },
        test: {
          files: [
            {
              expand: true,
              cwd: "test/spec",
              src: "**/*.coffee",
              dest: ".tmp/spec",
              ext: ".js"
            }
          ]
        }
      },
      filerev: {
        dist: {
          src: ["<%= yeoman.dist %>/scripts/**/*.js", "<%= yeoman.dist %>/styles/**/*.css", "<%= yeoman.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}", "<%= yeoman.dist %>/styles/fonts/*"]
        }
      },
      useminPrepare: {
        html: "<%= yeoman.app %>/index.html",
        options: {
          dest: "<%= yeoman.dist %>",
          flow: {
            html: {
              steps: {
                js: ["concat", "uglifyjs"],
                css: ["cssmin"]
              },
              post: {}
            }
          }
        }
      },
      usemin: {
        html: ["<%= yeoman.dist %>/**/*.html"],
        css: ["<%= yeoman.dist %>/styles/**/*.css"],
        options: {
          assetsDirs: ["<%= yeoman.dist %>", "<%= yeoman.dist %>/images"]
        }
      },
      imagemin: {
        options: {
          cache: false
        },
        dist: {
          files: [
            {
              expand: true,
              cwd: "<%= yeoman.app %>/images",
              src: "**/*.{png,jpg,jpeg,gif}",
              dest: "<%= yeoman.dist %>/images"
            }
          ]
        }
      },
      svgmin: {
        dist: {
          files: [
            {
              expand: true,
              cwd: "<%= yeoman.app %>/images",
              src: "**/*.svg",
              dest: "<%= yeoman.dist %>/images"
            }
          ]
        }
      },
      htmlmin: {
        dist: {
          options: {
            collapseWhitespace: true,
            conservativeCollapse: true,
            collapseBooleanAttributes: true,
            removeCommentsFromCDATA: true,
            removeOptionalTags: true
          },
          files: [
            {
              expand: true,
              cwd: "<%= yeoman.dist %>",
              src: ["*.html", "**/*.html"],
              dest: "<%= yeoman.dist %>"
            }
          ]
        }
      },
      ngAnnotate: {
        dist: {
          files: [
            {
              expand: true,
              cwd: ".tmp/concat/scripts",
              src: ["*.js", "!oldieshim.js"],
              dest: ".tmp/concat/scripts"
            }
          ]
        }
      },
      cdnify: {
        dist: {
          html: ["<%= yeoman.dist %>/*.html"]
        }
      },
      copy: {
        dist: {
          files: [
            {
              expand: true,
              dot: true,
              cwd: "<%= yeoman.app %>",
              dest: "<%= yeoman.dist %>",
              src: ["*.{ico,png,txt}", ".htaccess", "*.html", "**/*.html", "images/**/*.{webp}", "fonts/*"]
            }, {
              expand: true,
              cwd: ".tmp/images",
              dest: "<%= yeoman.dist %>/images",
              src: ["generated/*"]
            }, {
              expand: true,
              cwd: "bower_components/bootstrap/dist",
              src: "fonts/*",
              dest: "<%= yeoman.dist %>"
            }, {
              expand: true,
              cwd: "bower_components/font-awesome",
              src: "fonts/*",
              dest: "<%= yeoman.dist %>"
            }
          ]
        },
        styles: {
          expand: true,
          cwd: "<%= yeoman.app %>/styles",
          dest: ".tmp/styles/",
          src: "**/*.css"
        }
      },
      concurrent: {
        server: ["coffee:dist", "copy:styles"],
        test: ["coffee", "copy:styles"],
        dist: ["coffee", "copy:styles", "imagemin", "svgmin"]
      },
      karma: {
        options: {
          configFile: "test/unit/karma.conf.coffee"
        },
        unit: {
          singleRun: true
        },
        server: {
          singleRun: false
        }
      },
      protractor: {
        options: {
          configFile: "test/e2e/protractor.conf.coffee",
          keepalive: true,
          noColor: false,
          args: {}
        },
        all: {}
      },
      run: {
        bootstrap_e2e: {
          cmd: "./test/e2e/bootstrap_e2e.sh"
        }
      }
    });
    grunt.registerTask("serve", "Compile then start a connect web server", function(target) {
      if (target === "dist") {
        return grunt.task.run(["build", "connect:dist:keepalive"]);
      }
      return grunt.task.run(["clean:server", "wiredep", "concurrent:server", "postcss", "connect:livereload", "watch"]);
    });
    grunt.registerTask("server", "DEPRECATED TASK. Use the \"serve\" task instead", function(target) {
      grunt.log.warn("The `server` task has been deprecated. Use `grunt serve` to start a server.");
      return grunt.task.run(["serve:" + target]);
    });
    grunt.registerTask("test", ["clean:server", "concurrent:test", "postcss", "connect:test", "karma:unit"]);
    grunt.registerTask("test-e2e", ["concurrent:test", "run:bootstrap_e2e", "protractor:all"]);
    grunt.registerTask("test-server", ["clean:server", "concurrent:test", "postcss", "connect:test", "karma:server"]);
    grunt.registerTask("build", ["clean:dist", "wiredep", "useminPrepare", "concurrent:dist", "postcss", "concat", "ngAnnotate", "copy:dist", "cdnify", "cssmin", "uglify", "filerev", "usemin", "htmlmin"]);
    return grunt.registerTask("default", ["test", "build"]);
  };

}).call(this);
