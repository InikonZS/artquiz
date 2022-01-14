import {serverConfig} from "./apps/server/webpack.part";
import {webAppConfig} from "./apps/web_app/webpack.part";
import {commonConfig} from "./webpack.common";

export default [
    /** server  **/ {...commonConfig, ...serverConfig},
    /** web_app **/ {...commonConfig, ...webAppConfig},
]
