/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {runLanguageServer} from '../../common/language-server-runner.js';
import {golangConfig} from '../config.js';

export const runGolangLanguageServer = (baseDir: string, relativeDir: string) => {
    console.debug(baseDir, relativeDir);
    // 设置环境变量
    const env = Object.assign({}, process.env, {
        GOPLS_WORKSPACE: golangConfig.workspace,
    });
    runLanguageServer({
        serverName: 'GOLANG',
        pathName: golangConfig.path,
        serverPort: golangConfig.port,
        runCommand: 'gopls',
        runCommandArgs: [
            '-mode',
            'stdio'
        ],
        wsServerOptions: {
            noServer: true,
            perMessageDeflate: false
        },
        spawnOptions: {env}
    });
};
