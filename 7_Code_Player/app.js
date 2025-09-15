(function () {
    const STORAGE_KEYS = {
        html: 'codeplayer_html',
        css: 'codeplayer_css',
        js: 'codeplayer_js'
    };

    const $html = $('#editor-html');
    const $css = $('#editor-css');
    const $js = $('#editor-js');
    const $iframe = $('#preview');

    function getInitialValue(key, fallback) {
        try {
            const v = localStorage.getItem(key);
            return v !== null ? v : fallback;
        } catch (_) {
            return fallback;
        }
    }

    const defaultHtml = '<div class="box">Hello, Code Player!</div>';
    const defaultCss = '.box { padding: 12px; background:#e0f2fe; color:#0f172a; border-radius:8px; font: 600 16px/1.4 system-ui; }\nbody{margin:16px; font-family: system-ui, -apple-system, Segoe UI, Roboto;}';
    const defaultJs = 'console.log("Welcome to Code Player");';

    $html.val(getInitialValue(STORAGE_KEYS.html, defaultHtml));
    $css.val(getInitialValue(STORAGE_KEYS.css, defaultCss));
    $js.val(getInitialValue(STORAGE_KEYS.js, defaultJs));

    function buildDocument(html, css, js) {
        return `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><style>${css}\n</style></head><body>${html}<script>${js}\n<\/script></body></html>`;
    }

    function render() {
        const doc = buildDocument($html.val() || '', $css.val() || '', $js.val() || '');
        const iframe = $iframe.get(0);
        if (!iframe) return;
        const { contentWindow } = iframe;
        if (!contentWindow) return;
        contentWindow.document.open();
        contentWindow.document.write(doc);
        contentWindow.document.close();
    }

    function debounce(fn, wait) {
        let t;
        return function () {
            clearTimeout(t);
            const self = this, args = arguments;
            t = setTimeout(function () { fn.apply(self, args); }, wait);
        };
    }

    const debouncedRender = debounce(render, 250);

    function persist() {
        try {
            localStorage.setItem(STORAGE_KEYS.html, $html.val() || '');
            localStorage.setItem(STORAGE_KEYS.css, $css.val() || '');
            localStorage.setItem(STORAGE_KEYS.js, $js.val() || '');
        } catch (_) { /* ignore quota */ }
    }

    function onInput() {
        persist();
        debouncedRender();
    }

    $html.on('input', onInput);
    $css.on('input', onInput);
    $js.on('input', onInput);

    $('#btn-run').on('click', render);
    $('#btn-clear').on('click', function () {
        $html.val('');
        $css.val('');
        $js.val('');
        persist();
        render();
    });

    $(document).on('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            render();
        }
    });

    // Initial render
    render();
})();


