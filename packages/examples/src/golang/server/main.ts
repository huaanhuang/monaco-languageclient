/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {runLanguageServer} from '../../common/language-server-runner.js';

export const runGolangLanguageServer = (baseDir: string, relativeDir: string) => {
    console.debug(baseDir, relativeDir);
    runLanguageServer({
        serverName: 'GOLANG',
        pathName: '/golang',
        serverPort: 30005,
        runCommand: 'gopls',
        runCommandArgs: [
            '-mode',
            'stdio'
        ],
        wsServerOptions: {
            noServer: true,
            perMessageDeflate: false
        }
    });
};
