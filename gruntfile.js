module.exports = function(grunt){
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        
        uglify: {
			options: {
    			/*compress: {
                    drop_console: true
                },*/
				mangle: false,
                sourceMap: true
			},
			build: {
				files: {
					"assets/js/word-game.min.js": [
						"bower_components/jquery/dist/jquery.min.js",
						"bower_components/jquery-color/jquery.color.js",
						"assets/js/modernizr.custom.20270.js",
						"assets/js/google.fastbutton.js",
						"assets/js/jquery.google.fastbutton.js",
						"assets/js/word-game.js"
					]
				}
			}
		},
		
		less: {
		  development: {
			options: {
			  paths: ["/"],
				compress: true
			},
			files: {
				"assets/css/word-game.css": "assets/css/word-game.less"
			}
		  }
		},

		watch: {    
			less: {
				files: ["assets/css/word-game.less"],
				tasks: ["less"]
			},
			
			js: {
				files: ["assets/js/word-game.js"],
				tasks: ["uglify"]
			}
		}
    });

    grunt.registerTask("default", []);

};