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
		name: 'Check Merge of Default Branch into User Branch',
		content: 'src/core/CheckMergeDefaultIntoUserBranch.md',
	},
	{
		name: 'Merge Default Branch into User Branch',
		content: 'src/core/MergeDefaultIntoUserBranch.md',
	},
	{
		name: 'Check Merge of User Branch into Default Branch',
		content: 'src/core/CheckMergeUserIntoDefaultBranch.md',
	},
	{
		name: 'Merge User Branch into Default Branch',
		content: 'src/core/MergeUserIntoDefaultBranch.md',
	},
	{
		name: 'Commit and Check PR',
		content: 'src/core/CommitAndCheck.md',
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

