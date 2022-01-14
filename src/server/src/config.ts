// import {  join } from 'path'
import nconf from 'nconf'
// import '../../web_app/src/config.json'

nconf.argv()
    .env()
    .file({file: require('../../web_app/src/config.json')});

export default nconf
