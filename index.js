import { LitElement, html } from 'lit-element';
import './editor.js';
import './output.js';
import 'typescript';

class LiveRunner extends LitElement {
    constructor() {
        super();
    }

    updated() {
        this.outputComponent = this.shadowRoot.querySelector('code-output');
    }

    onCodeUpdate(e) {
        const code = e.detail;
        // TODO transpile here
        const jsCode = ts.transpileModule(code, {
            compilerOptions: { module: ts.ModuleKind.CommonJS, reportDiagnostics: true }
        });
        console.log(jsCode);
        this.outputComponent.code = jsCode;
    }

    render() {
        return html`
        <code-editor @value=${(e) => this.onCodeUpdate(e)} ></code-editor>
        <code-output></code-output>
        `;
    }
}

customElements.define('live-runner', LiveRunner);
