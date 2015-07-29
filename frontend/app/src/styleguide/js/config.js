define({
	css_path: window.location.protocol + '//' +
				window.location.hostname +
				(window.location.port === '' ? '' : ':'+ window.location.port) +
				window.location.pathname +
				'css/imports.css',

	// You can optionally set configuration for marked.js
	marked_options: {
		tables: true,
		langPrefix: 'language-'
	},

	config_dir: window.location.protocol + '//' +
				window.location.hostname +
				(window.location.port === '' ? '' : ':'+ window.location.port) +
				'/static/'

});
