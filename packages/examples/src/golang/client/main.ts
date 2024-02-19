/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as monaco from 'monaco-editor';
import * as vscode from 'vscode';
import {whenReady} from '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-python-default-extension';
import {LogLevel} from 'vscode/services';
import {createConfiguredEditor, createModelReference} from 'vscode/monaco';
import {ExtensionHostKind, registerExtension} from 'vscode/extensions';
import getConfigurationServiceOverride, {
    updateUserConfiguration
} from '@codingame/monaco-vscode-configuration-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import {initServices, MonacoLanguageClient} from 'monaco-languageclient';
import {CloseAction, ErrorAction, MessageTransports} from 'vscode-languageclient';
import {WebSocketMessageReader, WebSocketMessageWriter, toSocket} from 'vscode-ws-jsonrpc';
import {
    RegisteredFileSystemProvider,
    registerFileSystemOverlay,
    RegisteredMemoryFile
} from '@codingame/monaco-vscode-files-service-override';
import {Uri} from 'vscode';
import {createUrl} from '../../common/client-commons.js';

const languageId = 'golang';
let languageClient: MonacoLanguageClient;

const createWebSocket = (url: string): WebSocket => {
    const webSocket = new WebSocket(url);
    webSocket.onopen = async () => {
        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        languageClient = createLanguageClient({
            reader,
            writer
        });
        await languageClient.start();
        reader.onClose(() => languageClient.stop());
    };
    return webSocket;
};

const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
    return new MonacoLanguageClient({
        name: 'Golang Language Client',
        clientOptions: {
            // use a language id as a document selector
            documentSelector: [languageId],
            // disable the default error handler
            errorHandler: {
                error: () => ({action: ErrorAction.Continue}),
                closed: () => ({action: CloseAction.DoNotRestart})
            },
            // pyright requires a workspace folder to be present, otherwise it will not work
            workspaceFolder: {
                index: 0,
                name: 'workspace',
                uri: monaco.Uri.parse('/Users/huangdingbo/data/editor')
            },
            synchronize: {
                fileEvents: [vscode.workspace.createFileSystemWatcher('**')]
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => {
                return Promise.resolve(transports);
            }
        }
    });
};

export const startGolangClient = async () => {
    // init vscode-api
    await initServices({
        userServices: {
            ...getThemeServiceOverride(),
            ...getTextmateServiceOverride(),
            ...getConfigurationServiceOverride(),
            ...getKeybindingsServiceOverride()
        },
        debugLogging: true,
        workspaceConfig: {
            workspaceProvider: {
                trusted: true,
                workspace: {
                    workspaceUri: Uri.file('/Users/huangdingbo/data/editor')
                },
                async open() {
                    return false;
                }
            },
            developmentOptions: {
                logLevel: LogLevel.Debug
            }
        }
    });

    console.log('Before ready themes');
    await whenReady();
    console.log('After ready themes');

    // extension configuration derived from:
    // https://github.com/microsoft/pyright/blob/main/packages/vscode-pyright/package.json
    // only a minimum is required to get pyright working
    const extension = {
        name: 'golang-client',
        publisher: 'monaco-languageclient-project',
        version: '1.0.0',
        engines: {
            vscode: '^1.78.0'
        },
        contributes: {
            languages: [{
                id: languageId,
                aliases: [
                    'Golang'
                ],
                extensions: [
                    '.go',
                ]
            }],
            commands: [],
            keybindings: []
        }
    };
    registerExtension(extension, ExtensionHostKind.LocalProcess);

    updateUserConfiguration(`{
        "editor.fontSize": 14,
        "workbench.colorTheme": "Default Dark Modern"
    }`);

    const fileSystemProvider = new RegisteredFileSystemProvider(false);
    fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/Users/huangdingbo/data/editor/model.go'), 'package foo\n\n// @timeout: 5\n// @doc: 示例函数\nfunc Bar(params map[string]interface{}) (interface{}, error) {\n\treturn "Hello World!", nil\n}'));
    registerFileSystemOverlay(1, fileSystemProvider);

    // use the file create before
    const modelRef = await createModelReference(monaco.Uri.file('/Users/huangdingbo/data/editor/model.go'));
    modelRef.object.setLanguageId(languageId);

    // create monaco editor
    createConfiguredEditor(document.getElementById('container')!, {
        model: modelRef.object.textEditorModel,
        automaticLayout: true
    });

    // create the web socket and configure to start the language client on open, can add extra parameters to the url if needed.
    createWebSocket(createUrl('localhost', 30005, '/golang', {
        // Used to parse an auth token or additional parameters such as import IDs to the language server
        authorization: 'UserAuth'
        // By commenting above line out and commenting below line in, connection to language server will be denied.
        // authorization: 'FailedUserAuth'
    }, false));
};
