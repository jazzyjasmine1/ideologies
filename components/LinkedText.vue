<script>
    import Icon from './Icon';
    import spelling from "../plugins/spelling";
    import { escapeHtml } from '../src/helpers';

    export default {
        mixins: [ spelling ],
        props: {
            text: { required: true },
            noicons: { type: Boolean },
            escape: { type: Boolean },
        },
        render(h) {
            let text = this.text;
            if (this.escape) {
                text = escapeHtml(text);
            }
            if (!this.text) {
                return h('span');
            }

            let isLink = false;
            let isIcon = false;
            let isEscape = false;
            let buffer = '';
            let linkBuffer = '';
            const children = [];
            const buildLink = _ => {
                if (isIcon) {
                    return h(Icon, {props: { v: buffer }});
                }

                const bufferNode = [ h('span', {domProps: { innerHTML: this.handleSpelling(buffer) }}) ];

                if (!isLink) {
                    return bufferNode;
                }

                linkBuffer = linkBuffer.replace(/≡/g, '='); // meh workaround, i know…

                if (linkBuffer === '') {
                    linkBuffer = '#' + buffer;
                }

                if (linkBuffer.indexOf('https://') === 0
                    || linkBuffer.indexOf('http://') === 0
                    || linkBuffer.indexOf('mailto:') === 0
                ) {
                    return h(
                        'a',
                        {domProps: {href: linkBuffer, target: '_blank', rel: 'noopener'}},
                        bufferNode,
                    );
                }

                if (linkBuffer.indexOf('#') === 0) {
                    return h(
                        'a',
                        {domProps: {href: linkBuffer}},
                        bufferNode,
                    );
                }

                return h('nuxt-link', {props: { to: linkBuffer || '/' + this.config.nouns.route + '#' + this.handleSpelling(buffer) }}, bufferNode);
            }
            const addChild = _ => {
                if (!buffer) {
                    return;
                }
                children.push(buildLink());
                buffer = '';
                linkBuffer = '';
            }
            for (let c of this.text) {
                if (c === '{') {
                    addChild();
                    isLink = true;
                    continue;
                } else if (c === '}') {
                    addChild();
                    isLink = false;
                    continue;
                } else if (isLink && c === '=') {
                    if (linkBuffer) {
                        linkBuffer += '='
                    }
                    linkBuffer += buffer;
                    buffer = '';
                    continue;
                } else if (c === '[' && !this.noicons) {
                    addChild();
                    if (isEscape) {
                        isEscape = false;
                    } else {
                        isIcon = true;
                        continue;
                    }
                } else if (c === ']' && !this.noicons) {
                    addChild();
                    if (isIcon) {
                        isIcon = false;
                        continue;
                    }
                } else if (c === '\\') {
                    isEscape = true;
                    continue;
                } else if (isEscape) {
                    buffer += '\\';
                    isEscape = false;
                }
                buffer += c;
            }
            addChild();

            return h('span', children);
        },
    }
</script>
