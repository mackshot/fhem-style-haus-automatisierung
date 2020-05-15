jQuery(document).ready(function ($) {
    HAM_loadCustomCss();
    HAM_editCustomCss();

    var themeVersion = '3.0b1';

    // attr WEB hiddenroom input -> Ansicht anpassen
    if ($('#hdr .maininput').length == 0) {
        $('#hdr').hide();
        $('#content').css({top: '10px'});
    } else {
        // Link mit Popup Button
        $('<div class="maininputPopupLink"></div>')
            .appendTo("#hdr")
            .click(function () {
                var hasCodeMirror = typeof AddCodeMirror == 'function';

                var textArea = $('<textarea rows="20" cols="60" style="width: 99%; ' + (hasCodeMirror ? 'opacity: 0;' : '') + '"/>');
                if (hasCodeMirror) {
                    AddCodeMirror(textArea, function(cm) { 
                        cm.on("change", function() { textArea.val(cm.getValue()) } );
                    });
                }

                $('<div title="Multiline Command"></div>')
                    .append(textArea)
                    .dialog({
                        modal: true,
                        width: $(window).width() * 0.9,
                        buttons: [
                            {
                                text: "Execute",
                                click: function() {
                                    FW_execRawDef(textArea.val());
                                }
                            }
                        ],
                        close: function() {
                            $(this).remove();
                        }
                    });
            });
    }

    // Add version to logo
    $('#logo').append($('<span class="theme-version">' + themeVersion + '</span>'));

    // Add clock
    $('#logo').append($('<span id="clock"></span>'));
    window.addEventListener('load', HA_getClock, false);

	// Clear spaces
    $('#content .devType, #menu .room a').each(function() {
        $(this).html($(this).html().replace(/&nbsp;/g, ''));
    });

    $('#content > br').remove();
    $('.makeSelect').parent().find('br').remove();

    // Add missing classes for elements
    $('.SVGplot').prevAll('a').addClass('plot-nav');

    // Icon selection
    $('button.dist').wrapAll('<div class="icons"/>');
    $('button.dist').css({width: '50px', height: '50px', margin: '5px', padding: '0'});
    $('button.dist > *').css({maxWidth: '40px', maxHeight: '40px', display: 'block', margin: '0px auto'});

    // Links in der Navigation hinzufügen
    var navElement = jQuery('#menu .room').last().find('tbody');
    navElement.append(
        $('<tr><td><div><a class="custom-menu-entry" href="https://github.com/klein0r/fhem-style-haus-automatisierung/issues/">Theme-Fehler melden (v' + themeVersion + ')</a></div></td></tr>')
    );
    navElement.append(
        $('<tr><td><div><a class="custom-menu-entry" href="https://github.com/mackshot/fhem-style-haus-automatisierung/issues/">Beta-Theme-Fehler melden (v' + themeVersion + ')</a></div></td></tr>')
    );

    // Automatische Breite für HDR Input
    function resizeHeader() {
        var baseWidth = $('#content').length ? $('#content').width() : $(window).width() - $('#menuScrollArea').width() - 30;

        $('#hdr').css({width: baseWidth + 'px'});
        $('.maininput').css({width: ($('#hdr').width() - $('.maininputPopupLink').outerWidth() - 4) + 'px'});
    }
    resizeHeader();
    $(window).resize(resizeHeader);

    // Klick auf Error-Message blendet diese aus
    $('body').on('click', '#errmsg', function() {
        $(this).hide();
    });

    $('.roomoverview .col1, .makeTable .col1').each(function(index) {
        $(this).parent().addClass('first-table-column');
    });

    // hide elements by name
    if (document.URL.indexOf('showall') != -1) {
        // don't hide anything
    } else {
        $('div.devType:contains("-hidden")').parent('td').hide();
    }

    // DevToolTips
    // Create Toolbar
    var elHaToolbar = $('<div>').attr('id', 'haToolbar').hide();
    $('body').append(elHaToolbar);

    $('#haToolbar').on('click', '.toHdr', function() {
        $('input.maininput').val($(this).text()).change();
    });

    function addToToolbar(val) {
        if (val.length > 0) {
            elHaToolbar.empty();
            jQuery.each(val, function(i, v) {
                $('<span>').addClass('toHdr').text(v).appendTo(elHaToolbar);
                $('<br>').appendTo(elHaToolbar);
            });
            elHaToolbar.show();
        }
    }

    $('table.internals .dname').click(function (e) {
        var deviceName = $(this).attr('data-name');
        var rowVal = $(this).text();

        if ($(this).html() == "TYPE") {
            addToToolbar(
                [
                    "GetType('" + deviceName + "');",
                    "InternalVal('" + deviceName + "', '" + rowVal + "', '');",
                    "[i:" + deviceName + ":TYPE]"
                ]
            );
        } else if ($(this).html() == "STATE") {
            addToToolbar(
                [
                    "Value('" + deviceName + "');",
                    "InternalVal('" + deviceName + "', '" + rowVal + "', '');",
                    "[i:" + deviceName + ":STATE]"
                ]
            );
        } else {
            addToToolbar(
                [
                    "InternalVal('" + deviceName + "', '" + rowVal + "', '');",
                    "[i:" + deviceName + ":" + rowVal + "]"
                ]
            );
        }
    });

    $('table.readings .dname').click(function (e) {
        var deviceName = $(this).attr('data-name');
        var rowVal = $(this).text();

        addToToolbar(
            [
                "ReadingsVal('" + deviceName + "', '" + rowVal + "', '');",
                "[" + deviceName + ":" + rowVal + "]",
                "[r:" + deviceName + ":" + rowVal + "]",
                deviceName + ":" + rowVal + ":.*"
            ]
        );
    });

    $('table.attributes .dname').click(function (e) {
        var deviceName = $(this).attr('data-name');
        var rowVal = $(this).text();

        addToToolbar(
            [
                "AttrVal('" + deviceName + "', '" + rowVal + "', '');",
                "[a:" + deviceName + ":" + rowVal + "]",
                "global:ATTR." + deviceName + "." + rowVal + ".*"
            ]
        );
    });

    // Group attributes
    var attrSelect = $('select.attr');
    var attrList = new Object();
    attrList['general'] = ['userattr', 'verbose', 'disable', 'useSetExtensions', 'setList', 'disabledForIntervals', 'showtime'];
    attrList['readings'] = ['userReadings',  'oldreadings', 'suppressReading', 'readingList'];
    attrList['msg'] = ['msgContactAudio', 'msgContactLight', 'msgContactMail', 'msgContactPush', 'msgContactScreen', 'msgParams', 'msgPriority', 'msgRecipient', 'msgRecipientAudio', 'msgRecipientLight', 'msgRecipientMail', 'msgRecipientPush', 'msgRecipientScreen', 'msgRecipientText', 'msgTitle', 'msgTitleShrt', 'msgType'];
    attrList['events'] = ['event-aggregator', 'event-min-interval', 'event-on-change-reading', 'event-on-update-reading', 'eventMap', 'timestamp-on-change-reading', 'setExtensionsEvent'];
    attrList['fhemweb'] = ['alias', 'comment', 'cmdIcon', 'devStateIcon', 'devStateStyle', 'group', 'icon', 'room', 'sortby', 'stateFormat', 'webCmd', 'webCmdLabel', 'widgetOverride'];
    attrList['floorplan'] = ['fp_arrange', 'fp_backgroundimg', 'fp_default', 'fp_noMenu', 'fp_roomIcons', 'fp_setbutton', 'fp_viewport'];
    attrList['database'] = ['DbLogExclude', 'DbLogInclude'];

    var optGroups = new Object();
    optGroups['device'] = $('<optgroup label="device"></optgroup>');
    for (var attrGroup in attrList) {
        optGroups[attrGroup] = $('<optgroup label="' + attrGroup + '"></optgroup>');
    }

    if (attrSelect) {
        // clear the original list
        var attributeOptionList = attrSelect.children();
        var selectedItem = attrSelect.find('option:selected');
        attrSelect.empty();

        // add attributes to predefined optgroups
        attributeOptionList.each(function(i, e) {
            var found = false;
            for (var attrGroup in attrList) {
                if (attrList[attrGroup].indexOf($(e).attr('value')) > -1) {
                    optGroups[attrGroup].append(e);
                    found = true;
                }
            }

            if (!found) {
                optGroups['device'].append(e);
            }
        });

        // add optgroups to select
        for (var optGroup in optGroups) {
            if (optGroups[optGroup].children().length) {
                attrSelect.append(optGroups[optGroup]);
            }
        };

        // select previously selected item
        selectedItem.prop('selected', true);
    }

    (function($, window, document, undefined) {
        'use strict';

        var elSelector = '#hdr, #logo',
            elClassHidden = 'header--hidden',
            throttleTimeout = 50,
            $element = $(elSelector);

        if (!$element.length) return true;

        var $window = $(window),
            wHeight = 0,
            wScrollCurrent = 0,
            wScrollBefore = 0,
            wScrollDiff = 0,
            $document = $(document),
            dHeight = 0,
            throttle = function(delay, fn) {
                var last, deferTimer;
                return function() {
                    var context = this, args = arguments, now = +new Date;
                    if (last && now < last + delay) {
                        clearTimeout(deferTimer);
                        deferTimer = setTimeout(
                            function() {
                                last = now;
                                fn.apply(context, args);
                            },
                            delay
                        );
                    } else {
                        last = now;
                        fn.apply(context, args);
                    }
                };
            };

        $window.on('scroll', throttle(throttleTimeout, function() {
            dHeight = $document.height();
            wHeight	= $window.height();
            wScrollCurrent = $window.scrollTop();
            wScrollDiff = wScrollBefore - wScrollCurrent;

            if (wScrollCurrent <= 50) {
                $element.removeClass(elClassHidden);
            } else if (wScrollDiff > 0 && $element.hasClass(elClassHidden)) {
                $element.removeClass(elClassHidden);
            } else if (wScrollDiff < 0) {
                if (wScrollCurrent + wHeight >= dHeight && $element.hasClass(elClassHidden)) {
                    $element.removeClass(elClassHidden);
                } else {
                    $element.addClass(elClassHidden);
                }
            }

            wScrollBefore = wScrollCurrent;
        }));

    })(jQuery, window, document);
});

function HA_getClock() {
    var d = new Date();
    nhour = d.getHours();
    nmin = d.getMinutes();

    if (nhour <= 9) {
        nhour = '0' + nhour;
    }

    if (nmin <= 9) {
        nmin = '0' + nmin;
    }

    document.getElementById('clock').innerHTML = nhour + ':' + nmin + ' Uhr';

    setTimeout(HA_getClock, 1000);
}

var HAM_Web = $("body").attr("data-webname");
var HAM_cssId = 'HAM_css_custom';
var HAM_sassLoaded = false;
var HAM_lsKey = 'hausautomatisierung_com-mackshot.custom.css';
var HAM_customRulesReading = "HAM_customRules";
function HAM_updateSass() {
    var compile = function() {
        HAM_loadCustomRules(function (rules) {
            var sass = new Sass();
            var scss = HAM_transformCustomRulesToSCss(rules);
            sass.compile(scss, function(result) {
                console.log(result);
               var cssElement = document.getElementById(HAM_cssId);
                if (cssElement != null) {
                    if (result.text === undefined) {
                        cssElement.innerText = '';    
                        localStorage.setItem(HAM_lsKey, '');
                    } else {
                        cssElement.innerText = result.text;
                        localStorage.setItem(HAM_lsKey, result.text);
                    }
                }
            });
        });
    }

    if (!HAM_sassLoaded) {
        var onLoad = function() {
            Sass.setWorkerUrl(FW_root + '/pgm2/hausautomatisierung_com-mackshot.sass.worker.js');
            compile();
        };

        var scriptTag = document.createElement('script');
        scriptTag.src = FW_root + '/pgm2/hausautomatisierung_com-mackshot.sass.js';
        scriptTag.onload = onLoad;
        scriptTag.onreadystatechange = onLoad;
    
        document.body.appendChild(scriptTag);
    } else {
        compile();
    }
}

function HAM_editCustomCss() {
    if ($("div.fileList.styles").length >= 1) {
        var block = $("div.fileList.styles").closest("td");
        block.append('<div class="fileList">Edit Style</div>');
        block.append('<table class="editStyle block list wide"><tbody></tbody></table>');

        HAM_loadCustomRules(function(customRules) {
            var table = $("table.editStyle>tbody");
            var cc = 0;
            for (var i in customRules) {
                var c = HAM_customRulesObj[i];
                var customRule = customRules[i];
                var rowClass = (cc++ % 2 == 0 ? "even" : "odd");
                if (c.type == 'colorPicker') {
                    table.append('<tr item="' + i + '" class="' + i.replace(".", "__") + ' ' + rowClass + '"><td><div>' + i + '</div></td><td><input class="val" type="color" value="' + customRule.val + '" style="width: 100px;" ' + (customRule.val == null ? 'disabled="disabled"' : '') + '></td><td><input type="checkbox" value="1" ' + (customRule.val == null ? 'checked="checked"' : '') + '>Standard</td></tr>');
                }
            }
        });

        block.on('change', 'table.editStyle>tbody input', function() { HAM_setCustomCss($(this).closest("tr").attr("item")); });
    }
}

function HAM_setCustomCss(key) {
    if ($("table.editStyle tr." + key.replace(".", "__") + " input[type=checkbox]:checked").length == 1) {
        $("table.editStyle tr." + key.replace(".", "__") + " input[type!=checkbox]").prop('disabled', true);
        HAM_loadCustomRules(function(customRules) {
            customRules[key].val = null;
            HAM_saveCustomRules(customRules);
            HAM_updateSass();
        });
    } else {
        $("table.editStyle tr." + key.replace(".", "__") + " input[type!=checkbox]").prop('disabled', false);
        var val = $("table.editStyle tr." + key.replace(".", "__") + " input.val").val();
        HAM_loadCustomRules(function(customRules) {
            customRules[key].val = val;
            HAM_saveCustomRules(customRules);
            HAM_updateSass();
        });
    }
}

function HAM_loadCustomCss() {
    var exists = document.getElementById(HAM_cssId);
    if (exists != null) {
        document.removeChild(exists);
    }
    var cssContent = localStorage.getItem(HAM_lsKey);
    var cssTag = document.createElement("style");
    cssTag.id = HAM_cssId;
    if (cssContent != null) {
        cssTag.innerText = cssContent;
    } else {
        HAM_updateSass();
    }
    document.body.appendChild(cssTag);
}

function HAM_loadCustomRules(action) {
    FW_cmd(FW_root + '?cmd=jsonlist2 ' + $("body").attr("data-webname") + " " + HAM_customRulesReading + "&XHR=1", function(a) {
        var j = JSON.parse(a);
        var readings = j.Results[0].Readings;

        var customRules = {};
        if (readings[HAM_customRulesReading] != undefined) {
            customRules = JSON.parse(atob(readings[HAM_customRulesReading].Value));
        } else {
            for (var i in HAM_customRulesObj) {
                customRules[i] = { val: null };
            }

            HAM_saveCustomRules(customRules);
        }
        action(customRules);
    })
}

function HAM_saveCustomRules(obj) {
    FW_cmd(FW_root + '?cmd=setreading ' + $("body").attr("data-webname") + " " + HAM_customRulesReading + " " + btoa(JSON.stringify(obj)) + "&XHR=1", function(a) {
        console.log(a);
    })
}

function HAM_transformCustomRulesToSCss(obj) {
    var string = '';
    for (var i in obj) {
        if (obj[i].val != null) {
            for (var j in HAM_customRulesObj[i].pattern) {
                var p = HAM_customRulesObj[i].pattern[j].split("|");
                string += "\n" + p[0] + " { " + p[1] + ": " + obj[i].val + " !important; }";
            }
        }
    }
    return string;
}

var HAM_customRulesObj = {
    'SVGplot.l0': { type: 'colorPicker', pattern: ['.SVGplot.l0|stroke', '.SVGplot.l0fill|stroke', '.SVGplot.l0dot|stroke', '.SVGplot.l0fill_stripe|stroke', '.SVGplot.l0fill_gyr|stroke', 'text.SVGplot.l0|fill', 'text.SVGplot.l0fill|fill', 'text.SVGplot.l0dot|fill', 'text.SVGplot.l0fill_stripe|fill', 'text.SVGplot.l0fill_gyr|fill'], val: null },
    'SVGplot.l1': { type: 'colorPicker', pattern: ['.SVGplot.l1|stroke', '.SVGplot.l1fill|stroke', '.SVGplot.l1dot|stroke', '.SVGplot.l1fill_stripe|stroke', 'text.SVGplot.l1|fill', 'text.SVGplot.l1fill|fill', 'text.SVGplot.l1dot|fill', 'text.SVGplot.l1fill_stripe|fill'], val: null },
    'SVGplot.l2': { type: 'colorPicker', pattern: ['.SVGplot.l2|stroke', '.SVGplot.l2fill|stroke', '.SVGplot.l2dot|stroke', 'text.SVGplot.l2|fill', 'text.SVGplot.l2fill|fill', 'text.SVGplot.l2dot|fill'], val: null },
    'SVGplot.l3': { type: 'colorPicker', pattern: ['.SVGplot.l3|stroke', '.SVGplot.l3fill|stroke', '.SVGplot.l3dot|stroke', 'text.SVGplot.l3|fill', 'text.SVGplot.l3fill|fill', 'text.SVGplot.l3dot|fill'], val: null },
    'SVGplot.l4': { type: 'colorPicker', pattern: ['.SVGplot.l4|stroke', '.SVGplot.l4fill|stroke', '.SVGplot.l4dot|stroke', 'text.SVGplot.l4|fill', 'text.SVGplot.l4fill|fill', 'text.SVGplot.l4dot|fill'], val: null },
    'SVGplot.l5': { type: 'colorPicker', pattern: ['.SVGplot.l5|stroke', '.SVGplot.l5fill|stroke', '.SVGplot.l5dot|stroke', 'text.SVGplot.l5|fill', 'text.SVGplot.l5fill|fill', 'text.SVGplot.l5dot|fill'], val: null },
    'SVGplot.l6': { type: 'colorPicker', pattern: ['.SVGplot.l6|stroke', '.SVGplot.l6fill|stroke', '.SVGplot.l6dot|stroke', 'text.SVGplot.l6|fill', 'text.SVGplot.l6fill|fill', 'text.SVGplot.l6dot|fill'], val: null },
    'SVGplot.l7': { type: 'colorPicker', pattern: ['.SVGplot.l7|stroke', '.SVGplot.l7fill|stroke', '.SVGplot.l7dot|stroke', 'text.SVGplot.l7|fill', 'text.SVGplot.l7fill|fill', 'text.SVGplot.l7dot|fill'], val: null },
    'SVGplot.l8': { type: 'colorPicker', pattern: ['.SVGplot.l8|stroke', '.SVGplot.l8fill|stroke', '.SVGplot.l8dot|stroke', 'text.SVGplot.l8|fill', 'text.SVGplot.l8fill|fill', 'text.SVGplot.l8dot|fill'], val: null },
}