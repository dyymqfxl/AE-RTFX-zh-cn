/* RTFX 2.8.1 Chinese UI patch final. ES5 for Adobe CEP.
 * Keep original pack/category/item identities intact; translate display text only.
 * Load AFTER script.js and install.js, before DOM ready.
 */
(function (window, document, $) {
    'use strict';
    if (!$ || window.RTFX_ZH) { return; }
    var words = {
        'FX elements':'特效元素','Transitions':'转场','Typography':'文字排版',
        'Backgrounds':'背景','Foregrounds':'前景','Sound FX':'音效','Tools':'工具',
        'Brush':'笔刷','Comic':'漫画','Debris':'碎片','Electricity':'电流',
        'Energy':'能量','Explosion':'爆炸','Fire':'火焰','Flash':'闪光',
        'Glitch':'故障','Lines':'线条','Liquid':'液体','Simple':'简约',
        'Smoke':'烟雾','Sparks':'火花','Stylized':'风格化','Matte':'遮罩',
        'Matte Brush':'笔刷遮罩','Miscellaneous':'其他','Seamless':'无缝转场',
        'Seamless PageTurn':'无缝翻页','Seamless Rotate 3D':'无缝三维旋转',
        'Seamless Stretch':'无缝拉伸','Seamless Warp':'无缝扭曲','Shapes':'形状',
        'Logo Reveals #1':'标志展示 #1','Logo Reveals #2':'标志展示 #2',
        'Logo Reveals #3':'标志展示 #3','Lower Thirds':'下三分之一字幕',
        'Social media':'社交媒体','Titles':'标题','Grunge':'做旧纹理',
        'Speed lines':'速度线','Bar':'条形','8bit':'8位像素','Hit':'撞击',
        'Ice':'冰','Interface':'界面','Logo Set 1':'标志音效 1',
        'Logo Set 2':'标志音效 2','Logo Set 3':'标志音效 3','Snow':'雪',
        'Switch':'切换','Swoosh':'呼啸','Tear':'撕裂','Alpha-based':'基于透明通道',
        'Brainstorm':'创意组合','Distortion':'扭曲','Loop':'循环',
        'Mask-based':'基于蒙版','Shaking':'抖动','Stylization':'风格化',
        'Store':'商店','All packs':'全部素材包','Install packs':'安装素材包',
        'Install pack':'安装素材包','Favorites':'收藏夹','Sound on/off':'声音开关',
        'Remove unused':'清理未使用素材','Remove':'移除素材包','Reset keys':'重置授权码'
    };
    function translate(text) {
        var clean = $.trim(text), match = /^(\d+\.\s*)(.*)$/.exec(clean);
        if (match && words[match[2]]) { return match[1] + words[match[2]]; }
        return words[clean] || text;
    }
    function localize(scope) {
        var nodes = $(scope).find('.category-name, #updates h2, #all-packs a, #all-packs-btn, .remove-pack, .reset-keys');
        nodes.each(function () {
            // Text nodes only: preserve icons and jQuery event/data bindings.
            for (var i = 0; i < this.childNodes.length; i++) {
                var node = this.childNodes[i];
                if (node.nodeType === 3) {
                    var next = translate(node.nodeValue);
                    if (next !== node.nodeValue) { node.nodeValue = next; }
                }
            }
            if ($(this).hasClass('category-name')) {
                var cat = $(this).closest('[data-category-name]');
                $(this).attr('title', $.trim($(this).text()) + ' / ' + cat.attr('data-category-name'));
                $(this).attr('tabindex', '0').attr('role', 'button');
            }
        });
        $(scope).find('[title]').not('.category-name, .item').each(function () {
            var current = this.getAttribute('title'), next = translate(current);
            if (next !== current) { this.setAttribute('title', next); }
        });
        $(scope).find('.fav-img').each(function () {
            $(this).attr('title', $(this).hasClass('active') ? '取消收藏（已收藏）' : '加入收藏');
        });
        $(scope).find('.favorites-button').attr('title', '收藏夹');
    }
    function selectCategory(row) {
        var pane = row.closest('.tab-pane');
        pane.find('.rtfx-selected').removeClass('rtfx-selected');
        pane.find('.category-name').removeAttr('aria-current');
        row.addClass('rtfx-selected').children('.category-data').children('.category-name').attr('aria-current', 'true');
    }
    // Original hookSubCat reads visible English text for root-category filtering.
    // Replace that hook before the original ready callback invokes it, using stable data attributes.
    window.hookSubCat = function () {
        $(document).off('.rtfxZhCategory');
        $(document).on('click.rtfxZhCategory', '.cat-levels', function (event) {
            event.stopPropagation();
            var row = $(this), pane = row.closest('.tab-pane');
            var name = row.attr('data-category-name'), parent = row.attr('data-parent-category');
            pane.find('.item').hide().filter(function () {
                return $(this).attr('data-category') === name && $(this).attr('data-parent') === parent;
            }).show();
            selectCategory(row);
        });
        $(document).on('click.rtfxZhCategory', '.root-level', function () {
            var row = $(this), pane = row.closest('.tab-pane');
            var name = row.attr('data-category-name'), header = row.children('.category-data');
            if (row.hasClass('has-sub-cat')) {
                var expanded = header.hasClass('active');
                pane.find('.cat-levels').hide();
                pane.find('.root-level > .category-data').removeClass('active');
                if (!expanded) { row.children('.cat-levels').show(); header.addClass('active'); }
                header.children('.category-name').attr('aria-expanded', expanded ? 'false' : 'true');
            }
            pane.find('.item').hide().filter(function () {
                return $(this).attr('data-category') === name || $(this).attr('data-parent') === name;
            }).show();
            selectCategory(row);
        });
        $(document).on('keydown.rtfxZhCategory', '.category-name', function (event) {
            if (event.which === 13 || event.which === 32) { event.preventDefault(); $(this).click(); }
        });
    };
    $(function () {
        document.documentElement.lang = 'zh-CN';
        document.title = 'RTFX 中文版';
        $('.search input').attr('placeholder', '搜索英文素材名').attr('title', '按英文素材名称搜索');
        $('#scale-to').attr('title', '缩小缩略图');
        $('#scale-from').attr('title', '放大缩略图');
        $('#close-packs').attr('title', '关闭');
        localize(document);
        // Packs are generated asynchronously by the original extension.
        var scheduled = false;
        var observer = new MutationObserver(function () {
            if (scheduled) { return; }
            scheduled = true;
            window.setTimeout(function () { scheduled = false; localize(document); }, 0);
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
        window.RTFX_ZH.observer = observer;
    });
    window.RTFX_ZH = { version: 'final-ui-only', translate: translate, localize: localize, words: words };
}(window, document, window.jQuery));
