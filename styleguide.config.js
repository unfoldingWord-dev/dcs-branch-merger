const path = require('path');
const upperFirst = require('lodash/upperFirst');
const camelCase = require('lodash/camelCase');
const { name, version, repository } = require('./package.json');
const { styles, theme } = require('./styleguide.styles');

let sections = [
	{
		name: 'README',
		content: 'README.md',
	},
	{
		name: 'TSV String to Table',
		content: 'src/core/TsvStringToTable.md',
	},
	{
		name: 'TSV String to Table with Errors',
		content: 'src/core/TsvStringToTableWithErrors.md',
	},
	{
		name: 'Table to TSV String',
		content: 'src/core/TableToTsvString.md',
	},
	{
		name: 'Table to TSV String with Errors',
		content: 'src/core/TableToTsvStringWithErrors.md',
	},
	{
		name: 'Round Trip Example',
		content: 'src/core/RoundTrip.md',
	},

];

module.exports = {
	title: `${upperFirst(camelCase(name))} v${version}`,
	ribbon: {
		url: repository.url,
		text: 'View on GitHub'
	},
	styles,
	theme,
	getComponentPathLine: (componentPath) => {
		const dirname = path.dirname(componentPath, '.js');
		const file = dirname.split('/').slice(-1)[0];
		const componentName = upperFirst(camelCase(file));
		return `import { ${componentName} } from "${name}";`;
	},
	usageMode: 'expand',
	exampleMode: 'expand',
	pagePerSection: true,
	sections,
	components: 'src/core/**/[A-Z]*.js',
	defaultExample: true,
	moduleAliases: {
		'rsg-example': path.resolve(__dirname, 'src'),
	},
	version,
	webpackConfig: {
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
				},
				{
					test: /\.css$/,
					loader: 'style-loader!css-loader',
				},
			],
		},
	},
};

