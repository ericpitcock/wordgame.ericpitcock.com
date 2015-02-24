module.exports = function(grunt){
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        
        uglify: {
			options: {
				mangle: false,
                sourceMap: true
			},
			build: {
				files: {
					"assets/js/main.min.js": [
						"bower_components/jquery/dist/jquery.min.js",
						"bower_components/jquery-color/jquery.color.js",
						"assets/js/main.js"
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
				"assets/css/style.css": "assets/css/style.less"
			}
		  }
		},

		watch: {    
			less: {
				files: ["assets/css/style.less"],
				tasks: ["less"]
			},
			
			js: {
				files: ["assets/js/main.js"],
				tasks: ["uglify"]
			}
		}
    });

    grunt.registerTask("default", []);

};