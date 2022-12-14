export default {
    methods: {
        getHash() {
            if (!process.client) { return null; }

            return decodeURIComponent(window.location.hash.substr(1).replace(/=$/, ''));
        },
        handleHash(namespace, callback, checkAnchor = true) {
            if (!process.client) { return; }

            const doHandle = () => {
                const anchor = this.getHash();
                const $anchor = document.getElementById(anchor);
                if (checkAnchor && $anchor) {
                    $anchor.scrollIntoView();
                } else if (!namespace) {
                    callback(anchor);
                } else if (anchor.startsWith(namespace + '/')) {
                    callback(anchor.substring(namespace.length + 1));
                }
            }

            setTimeout(_ => {
                doHandle();
                window.addEventListener('hashchange', function() {
                    doHandle();
                }, false);
            }, 500);
        },
        setHash(namespace, value) {
            if (!process.client) { return; }
            const current = this.getHash();
            const fullValue = namespace ? namespace + '/' + value : value

            if (fullValue === current) { return; }

            history.pushState(
                '',
                document.title,
                window.location.pathname + window.location.search
                    + (value ? '#' + fullValue : '')
            );
        },
    }
}
