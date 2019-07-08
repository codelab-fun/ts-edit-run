import { LitElement, html } from 'lit-element';
import 'ace-builds/src-noconflict/ace.js';
import 'typescript';
import { MyRange } from './range.js';

class Editor extends LitElement {
    constructor() {
        super();
    }

    onUpdate(code) {
        this.dispatchEvent(new CustomEvent('value', { detail: code }));
    }

    render() {
        return html`
        <style>
            #editor-container {
            }
            #editor {
                width: 500px;
                height: 500px;
            }
        </style>

        <div id="editor-container">
            <div id='editor'></div>
        </div>
        <button @click=${this.runCode}>Update</button>
        `;
    }


    firstUpdated() {
        const CDN = 'https://cdn.jsdelivr.net/npm/ace-builds@1.4.5/src-min-noconflict';
        ace.config.set('basePath', CDN);
        ace.config.set('modePath', CDN);
        ace.config.set('themePath', CDN);
        ace.config.set('workerPath', CDN);
        let editorDiv = this.shadowRoot.querySelector('#editor');
        let editor = ace.edit(editorDiv, {
        });
        this.editor = editor;
        editor.session.setMode('ace/mode/typescript');
        editor.renderer.attachToShadowRoot();

        editor.session.on('change', (delta) => {
            const code = this.editor.getValue() + 'export {};';

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

            // initialize SourceFile instance
            //let sf = ts.createSourceFile(virtualFileName, code, ts.ScriptTarget.ES2015);

            // Make program as collection of my one virtual file
            let prog = ts.createProgram([file.fileName], options, compilerHost);

            // process response as you need.
            let diagnostics = prog.getSyntacticDiagnostics(file.sourceFile)
                .concat(prog.getSemanticDiagnostics(file.sourceFile));
            console.log(diagnostics);
            diagnostics.forEach(error => {
                let start = getAcePositionFromChar(editor, error.start);
                let end = getAcePositionFromChar(editor, error.start + error.length);
                let range = MyRange(start.row, start.column, end.row, end.column);
                editor.session.addMarker(range, "typescript-error", "text", true);
            });
        });
    }
}

customElements.define('code-editor', Editor);

function getAcePositionFromChar(editor, charPosition) {
    let doc = editor.getSession().getDocument();
    return getPosition(doc, charPosition);
}

function getPosition(doc, chars) {
    var count, i, line, lines, row;
    lines = doc.getAllLines();
    count = 0;
    row = 0;
    for (i in lines) {
        line = lines[i];
        if (chars < (count + (line.length + 1))) {
            return {
                row: row,
                column: chars - count
            };
        }
        count += line.length + 1;
        row += 1;
    }
    return {
        row: row,
        column: chars - count
    };
}