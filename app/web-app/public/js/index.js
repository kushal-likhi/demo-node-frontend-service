'use strict';
var isNode, __global;
window._inlinePlugins = window._inlinePlugins || [];
var newsOnRunApp = {
    eventHandlers: {
        onBlockUIElementsClick: function () {
            console.log($(this), $(this).attr('data-block-message'), $(this).data('block-message'));
            $.blockUI({
                message: '<h4 style="color:white"><img style="height: 20px;" src="/images/loader.gif" alt=""/>&nbsp;' + jQuery(this).attr('data-block-message') + '</h4>',
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: 1,
                    color: '#eee',
                    zIndex: 100010
                },
                overlayCSS: {
                    zIndex: 100000
                }
            });
        },
        validatePass: function (pf, cpf) {
            return function () {
                var $p = jQuery('#' + pf),
                    $cp = jQuery('#' + cpf);

                if ($p.val() == $cp.val()) {
                    document.getElementById(cpf).setCustomValidity('');
                } else {
                    document.getElementById(cpf).setCustomValidity('Passwords Don\'t Match');
                }
            }
        },
        init: function () {
            jQuery('.block-ui-on-click').click(this.eventHandlers.onBlockUIElementsClick);
            jQuery('#passS1').change(this.eventHandlers.validatePass('passS1', 'passS2'));
            jQuery('#passS2').change(this.eventHandlers.validatePass('passS1', 'passS2'));
        }
    },
    showErrorMessages: function () {
        var errorCode = getQueryVariable('error');
        if (errorCode) {
            switch (errorCode) {
                case '1011':
                    jQuery('#nug').val(getQueryVariable('email')).attr('data-hint', 'Unknown Email ID!');
                    break;
                case '1012':
                    jQuery('#nug').val(getQueryVariable('email'));
                    jQuery('#npg').attr('data-hint', 'Invalid Password!');
                    break;
            }
        }
    },
    identifyGlobal: function () {
        //Check if running from node js
        isNode = typeof window === 'undefined';
        //Define global fallback
        if (isNode) {
            console.log('Running from Node');
            __global = global;
        } else {
            __global = window;
        }
    },
    normalizeLogger: function () {
        //Fallback if console not defined
        __global.console = __global.console || {};
        console.log = console.log || function () {
            //Not supported
        };
    },
    plugins: {
    },
    loadAddOnPlugins: function () {
        for (var idx = 0; idx < window._inlinePlugins.length; idx++) {
            try {
                window._inlinePlugins[idx].init.call(window._inlinePlugins[idx]);
            } catch (c) {
                console.log('Unable to load plugin:', window._inlinePlugins[idx]);
                console.log(c);
            }
        }
    },
    init: new function () {
        jQuery(function () {
            newsOnRunApp.constructor.call(newsOnRunApp);
        });
    },
    constructor: function () {
        this.identifyGlobal.call(this);
        this.normalizeLogger.call(this);
        this.showErrorMessages.call(this);
        this.eventHandlers.init.call(this);
        this.loadAddOnPlugins.call(this);
    }
};

//Lib
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

function showToast(title, message, timeout, onClose) {
    var $m = $('<div class="growlUI"></div>');
    if (title) $m.append('<h1>' + title + '</h1>');
    if (message) $m.append('<h2>' + message + '</h2>');
    if (timeout === undefined) timeout = 3000;

    // Added by konapun: Set timeout to 30 seconds if this growl is moused over, like normal toast notifications
    var callBlock = function (opts) {
        opts = opts || {};
        var css = $.blockUI.defaults.growlCSS;
        css.zIndex = 100000;
        css.top = '100px';
        $.blockUI({
            message: $m,
            fadeIn: typeof opts.fadeIn !== 'undefined' ? opts.fadeIn : 700,
            fadeOut: typeof opts.fadeOut !== 'undefined' ? opts.fadeOut : 1000,
            timeout: typeof opts.timeout !== 'undefined' ? opts.timeout : timeout,
            centerY: false,
            showOverlay: false,
            onUnblock: onClose,
            css: css
        });
    };

    callBlock();
    var nonmousedOpacity = $m.css('opacity');
    $m.mouseover(function () {
        callBlock({
            fadeIn: 0,
            timeout: 30000
        });

        var displayBlock = $('.blockMsg');
        displayBlock.stop(); // cancel fadeout if it has started
        displayBlock.fadeTo(300, 1); // make it easier to read the message by removing transparency
    }).mouseout(function () {
        $('.blockMsg').fadeOut(1000);
    });
    // End konapun additions
}
