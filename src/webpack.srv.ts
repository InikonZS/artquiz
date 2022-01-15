import {Configuration, RuleSetRule, WatchIgnorePlugin, WebpackPluginInstance} from "webpack";
import {join} from "path";
import {tsRuleBase} from "../webpack.common";

const serverPlugins: WebpackPluginInstance[] = [
    new WatchIgnorePlugin({
        // paths: [join(__dirname, '..', 'apps', 'web_app')]
        paths: [
            join(__dirname, 'index.ts'),
            join(__dirname, 'ratalien'),
            join(__dirname, 'app'),
            join(__dirname, 'application'),
        ]
    })
]
const tsRuleServer: RuleSetRule = {
    ...tsRuleBase,
    options: {
        configFile: join(__dirname, '../tsconfig.srv.json')
    }
}
export const serverConfig: Configuration = {
    entry: join(__dirname, 'server', 'index.ts'),
    output: {
        path: join(__dirname, '..', 'dist', 'server'),
        filename: 'server.js'
    },
    target: 'node',
    plugins: serverPlugins,
    module: {
        rules: [tsRuleServer]
    },
    externals: {
        bufferutil: 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
      },
}