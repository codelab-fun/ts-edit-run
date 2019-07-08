import { LitElement, html } from 'lit-element';

class Output extends LitElement {
    static get properties() {
        return {
            code: {
                type: String,
                reflect: true
            }
        }
    }

    constructor() {
        super();
        this.code = '';
    }

    render() {
        return html`
        <div>${this.code}</div>
        `;
    }
}

customElements.define('code-output', Output);
