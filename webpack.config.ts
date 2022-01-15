import {serverConfig} from "./src/webpack.srv";
import {webAppConfig} from "./src/webpack.app";
import {commonConfig} from "./webpack.common";

export default [
    /** server  **/ {...commonConfig, ...serverConfig},
    /** web_app **/ {...commonConfig, ...webAppConfig},
]
