module.exports = {
	publicPath: process.env.NODE_ENV === 'production' ? '/multi-armed-bandit/' : '',
	chainWebpack: config => {
		config.plugin('html')
			.tap(args => {
				args[0].title = 'Multi armed bandit';
				
				return args;
			});
	}
};