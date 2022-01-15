import {Configuration, RuleSetRule} from "webpack";
import {isDev} from "./_utils";

export const tsRuleBase: RuleSetRule = {
    test: /\.[tj]s|tsx|ts$/, loader: 'ts-loader', exclude: /node_modules/ ,
}

export const commonConfig: Configuration = {
    mode: isDev ? 'development' : 'production',
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
}
