module.exports = function(grunt){
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        
        /*uglify: {
			options: {
				mangle: false,
                sourceMap: true
			},
			build: {
				files: {
					"assets/js/main.min.js": [
						"assets/js/vendor/jquery-2.0.3.min.js",
						"assets/js/vendor/retina-1.3.0.min.js",
						"assets/js/vendor/flexslider/jquery.flexslider-min.js",
						"assets/js/vendor/waypoints.min.js",
						"assets/js/vendor/imagelightbox.min.js",
						"assets/js/main.js"
					]
				}
			}
		},*/
		
		less: {
		  development: {
			options: {
			  paths: ["/"],
				compress: true
			},
			files: {
				"style.css": "style.less"
			}
		  }
		},

		watch: {    
			less: {
				files: ["style.less"],
				tasks: ["less"]
			},
			
			/*js: {
				files: ["main.js"],
				tasks: ["uglify"]
			}*/
		}
    });

    grunt.registerTask("default", []);

};