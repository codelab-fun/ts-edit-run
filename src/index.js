import { LitElement, html } from 'lit-element';
import './editor';
import './output.js';
import * as ts from 'typescript';

class LiveRunner extends LitElement {
    constructor() {
        super();
    }

    updated() {
        this.outputComponent = this.shadowRoot.querySelector('code-output');
    }

    onCodeUpdate(e) {
        const code = e.detail;
        const jsCode = ts.transpileModule(code, {
            compilerOptions: { module: ts.ModuleKind.CommonJS, reportDiagnostics: true }
        });
        this.outputComponent.code = jsCode.outputText;
    }

    render() {
        return html`
        <code-editor @value=${(e) => this.onCodeUpdate(e)} ></code-editor>
        <code-output></code-output>
        `;
    }
}

customElements.define('live-runner', LiveRunner);
