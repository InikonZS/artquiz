import {Configuration, RuleSetRule, WatchIgnorePlugin, WebpackPluginInstance} from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import {join} from "path";
import {tsRuleBase} from "../webpack.common";
import {isDev} from "../_utils";

const stylesHandler = !isDev ? MiniCssExtractPlugin.loader : 'style-loader';

const webAppPlugins: WebpackPluginInstance[] = [
    new HtmlWebpackPlugin(),
    new WatchIgnorePlugin({
        paths: [join(__dirname, 'server')]
    }),
    new MiniCssExtractPlugin({
        // filename: '[name][contenthash].css',
        filename: '[name].css',
      }),
]
const tsRuleWebApp: RuleSetRule = {
    ...tsRuleBase,
    options: {
        configFile: join(__dirname, '../tsconfig.app.json')
    }
}
export const webAppConfig: Configuration = {
    entry: join(__dirname, 'index.ts'),
    output: {
        path: join(__dirname, '..', 'dist', 'web_app'),
        filename: 'bundle.js'
    },
    target: 'web',
    plugins: webAppPlugins,
    module: {
        rules: [tsRuleWebApp,
            { test: /\.css$/i,
                use: [
                    stylesHandler, 
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                exportLocalsConvention: "camelCase",
                            },
                        },
                    }
                ],
              },
              { test: /\.(?:ico|gif|png|jpg|jpeg|mp3)$/i, type: 'asset/resource' },
              { test: /\.(woff(2)?|eot|ttf|otf|svg)$/i, type: 'asset/inline' },
        ]
    }
}