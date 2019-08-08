import { LitElement, html } from 'lit-element';
import ts from 'typescript';
import * as CodeMirror from 'codemirror-minified/lib/codemirror';
import 'codemirror-minified/mode/javascript/javascript';
const codeMirrorCSS = require('codemirror-minified/lib/codemirror.css').toString();

class Editor extends LitElement {
    constructor() {
        super();
    }

    render() {
        return html`
        <style>
            #editor {
                width: 500px;
                height: 500px;
            }
            .error {
                border-bottom: dotted 2px red;
            }

            .CodeMirror {
                height: auto;
                width: auto;
            }
        </style>

        <div id="editor-container">
            <style>
                ${codeMirrorCSS}
            </style>
            <div id='editor'></div>
        </div>
        <button @click=${this.runCode}>Update</button>
        `;
    }

    firstUpdated() {
        const editor = CodeMirror(this.shadowRoot.querySelector('#editor'), {
            lineNumbers: true,
            mode: "text/typescript"
        });

        this.editor = editor;

        editor.on('change', () => {
            this.editor.getAllMarks().forEach(marker => marker.clear());

            const code = this.editor.getValue() + '\n\n export {};';

            const options = {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES6,
                strict: true,
                suppressOutputPathCheck: false,
                lib: ['es6', 'dom']
            };

            const file = { fileName: `virtualFile.ts`, content: code };
            const compilerHost = {
                getSourceFile: (fileName) => {
                    file.sourceFile = file.sourceFile || ts.createSourceFile(fileName, file.content, ts.ScriptTarget.ES6, true);
                    return file.sourceFile;
                },
                writeFile: (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
                    console.log('writeFile =====> fileName: ', fileName, ', data: ', data);
                },
                getCurrentDirectory: () => {
                    return '';
                },
                useCaseSensitiveFileNames: () => {
                    return false;
                },
                getCanonicalFileName: (fileName) => {
                    return fileName;
                },
                fileExists: (fileName) => {
                    return true;
                },
                getDefaultLibFileName: (options) => {
                    return 'lib.d.ts';
                },
                getNewLine: () => {
                    return '\n';
                }
            }

            // Make program as collection of my one virtual file
            let prog = ts.createProgram([file.fileName], options, compilerHost);

            // process response as you need.
            let diagnostics = prog.getSyntacticDiagnostics(file.sourceFile)
                .concat(prog.getSemanticDiagnostics(file.sourceFile));

            // iterate over diagnostics and add markers
            diagnostics.forEach(msg => {
                let lineStart = 0;
                const line = code.slice(0, msg.start).split('').filter((c, i) => {
                    // record last line break
                    if (c === '\n') {
                        lineStart = i;
                        return true;
                    }
                }).length;
                const posOnLine = msg.start - lineStart - 1;

                this.editor.markText({ line: line, ch: posOnLine }, { line: line, ch: posOnLine + msg.length }, {
                    className: 'error',
                    attributes: {
                        title: msg.messageText
                    }
                });
            });
        });
    }

    runCode() {
        this.dispatchEvent(new CustomEvent('value', { detail: this.editor.getValue() }));
    }
}

customElements.define('code-editor', Editor);
