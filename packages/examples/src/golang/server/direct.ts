/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {resolve} from 'path';
import {getLocalDirectory} from '../../utils/fs-utils.js';
import {runGolangLanguageServer} from './main.js';

const baseDir = resolve(getLocalDirectory(import.meta.url));

const groovyJar = 'gopls';
const relativeDir = process.env.LANG_SERVER_GO_PATH || groovyJar;
console.log(`basedir: ${baseDir}`);
console.log(`groovyJar: ${groovyJar}`);
console.log(`LANG_SERVER_JAR_PATH: ${process.env.LANG_SERVER_GO_PATH}`);
console.log(`relativeDir: ${relativeDir}`);

runGolangLanguageServer(baseDir, relativeDir);
