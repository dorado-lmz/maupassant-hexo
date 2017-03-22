/*
 * Markdown Extra Syntax
 * ---------------------
 *
 * - Fenced Code with Highlight
 *
 *   ```javascript
 *   var foo = "bar";
 *   ```
 *
 * - Highlight Code with Inserted Code
 *
 *   ```javascript+
 *   var foo = "bar";
 *   ```
 *
 *  or
 *
 *   ````javascript
 *   var foo = "bar";
 *   ````
 *
 * - Just insert code
 *
 *   ```javascript-
 *   var foo = "bar";
 *   ```
 *
 *  or
 *
 *   `````javascript
 *   var foo = "bar";
 *   `````
 * */
(function() {
    'use strict';


    var rFenceCode = /(\s*)(`{3,}|~{3,}) *(.*) *\n?([\s\S]+?)\s*(\2)(\n+|$)/g;
    var rLang = /([^\s]+)\s*(.+)?\s*(.+)?/;

    var langMap = {
        'css': 'css',
        'htm': 'html',
        'html': 'html',
        'javascript': 'javascript',
        'js': 'javascript',
        'json': 'javascript'
    };

    var injectFn = {
        'javascript': function(code) {
            return '<script>' + code + '</script>';
        },
        'css': function(code) {
            return '<style type="text/css">' + code + '</style>';
        },
        'html': function(code) {
            return '<div class="hexo-insert-code">' + code + '</div>';
        }
    };

    function getLanguage(lang) {
        if (lang && langMap[lang]) {
            lang = langMap[lang];
        }
        return lang;
    }

    function canInject(lang) {
        return ['javascript', 'css', 'html'].indexOf(lang) !== -1;
    }

    function escapeCode(lang, code) {
        if (injectFn[lang]) {
            code = injectFn[lang](code);
        }
        return '\n<escape>' + code + '</escape>\n';
    }

    var blockTags = [
        'quote',
        'blockquote',
        'code',
        'codeblock',
        'pullquote',
        'div',
        'section'
    ];

    var inlineTags = [
        'jsfiddle',
        'gist',
        'iframe',
        'img',
        'link',
        'include_code',
        'youtube',
        'vimeo',
        'post_path',
        'post_link',
        'asset_path',
        'asset_img',
        'asset_link'
    ];

    function wrapBlockTag(language, options, content) {
        return '' +
            '{% ' + language + (options ? (' ' + options) : '') + ' %}\n' +
            content + '\n' +
            '{% end' + language + ' %}\n';
    }

    function wrapInlineTag(language, options) {
        return '{% ' + language + (options ? (' ' + options) : '') + ' %}';
    }

    function syntaxSugar(raw, language, options, content) {
        var blockIndex = blockTags.indexOf(language);
        var inlineIndex = inlineTags.indexOf(language);
        if (blockIndex === -1 && inlineIndex === -1) {
            return raw;
        }

        return blockIndex > -1 ?
            wrapBlockTag(language, options, content) : inlineIndex > -1 ?
            wrapInlineTag(language, options) : raw;
    }

    function syntaxExtra(raw, start, startQuote, language, options, content, endQuote, end) {
      // console.log("---------------")
        // console.log(raw);
        var quoteCount = startQuote.length;

        var hide = quoteCount >= 5;
        var inject = (quoteCount === 4 || hide);

        if (!inject) {
            return raw;
        }

        language = language.toLowerCase();
        language = getLanguage(language);

        inject = inject && canInject(language);

        if (!inject) {
            return raw;
        }

        // 
        var meta = language + (options ? (' ' + options) : '');
        var native = start + '```' + meta + '\n' + content + '\n```' + end;
        var injected = escapeCode(language, content);

        return hide ? injected : (native + injected);
    }

    function filter(data) {
        var source = data.source;
        var ext = source.substring(source.lastIndexOf('.')).toLowerCase();

        // ä¸å¤„ç†é™æ€æ–‡ä»¶
        if ('.js.css.html.htm'.indexOf(ext) > -1) {
            return;
        }

        data.content = data.content
            .replace(rFenceCode, function(raw, start, startQuote, meta, content, endQuote, end) {
                if (!meta) {
                    return raw;
                }
                console.log(content);
                var match = meta.match(rLang);
                var language;
                var options;

                if (match) {
                    language = match[1] || '';
                    options = match[2] || '';
                }

                if (!language) {
                    return raw;
                }

                var ext = language.substr(language.length - 1);
                if (ext === '+' || ext === '-') {
                    var fixedLang = language.substr(0, language.length - 1);
                    fixedLang = fixedLang.toLowerCase();
                    fixedLang = getLanguage(fixedLang);

                    if (canInject(fixedLang)) {
                        language = fixedLang;

                        startQuote = endQuote = ext === '+' ? '````' : '`````';
                    }
                }

                var quoteCount = startQuote.length;

                return quoteCount >= 4 ?
                    syntaxExtra(raw, start, startQuote, language, options, content, endQuote, end) : quoteCount === 3 ?
                    syntaxSugar(raw, language, options, content) : raw;

            });

    };

    hexo.extend.filter.register('before_post_render', filter, 9);
})();
