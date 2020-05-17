var HA_themeVersion = '3.0b1';

jQuery(document).ready(function ($) {
    HAM_loadCustomCss();
    HAM_editCustomCss();

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
    $('#logo').append($('<span class="theme-version">' + HA_themeVersion + '</span>'));

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
        $('<tr><td><div><a class="custom-menu-entry" href="https://github.com/mackshot/fhem-style-haus-automatisierung/issues/">Beta-Theme-Fehler melden (v' + HA_themeVersion + ')</a></div></td></tr>')
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
var HAM_lsKeyCss = 'hausautomatisierung_com-mackshot.custom.css';
var HAM_lsKeyThemeVersion = 'hausautomatisierung_com-mackshot.version';
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
                        localStorage.setItem(HAM_lsKeyCss, '');
                    } else {
                        cssElement.innerText = result.text;
                        localStorage.setItem(HAM_lsKeyCss, result.text);
                    }
                    localStorage.setItem(HAM_lsKeyThemeVersion, HA_themeVersion);
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
            var updateRules = false;
            var table = $("table.editStyle>tbody");
            var cc = 0;
            table.append('<tr class="odd"><td>Description</td><td>Setting</td><td>Theme Default Setting</td></tr>');
            for (var i in HAM_customRulesObj) {
                var c = HAM_customRulesObj[i];
                var customRule = customRules[i];
                if (customRule == undefined) {
                    updateRules = true;
                    customRule = { val: null };
                    customRules[i] = customRule;
                }
                var rowClass = (cc++ % 2 == 0 ? "even" : "odd");
                if (c.type == 'colorPicker') {
                    table.append('<tr item="' + i + '" class="' + i.replace(".", "__") + ' ' + rowClass + '"><td><div>' + i + '</div></td><td><input class="val" type="color" value="' + customRule.val + '" style="width: 100px;" ' + (customRule.val == null ? 'disabled="disabled"' : '') + '></td><td><input type="checkbox" value="1" ' + (customRule.val == null ? 'checked="checked"' : '') + '></td></tr>');
                }
            }

            if (updateRules) {
                HAM_saveCustomRules(customRules);
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
    var themeVersion = localStorage.getItem(HAM_lsKeyThemeVersion);
    var cssContent = localStorage.getItem(HAM_lsKeyCss);
    var cssTag = document.createElement("style");
    cssTag.id = HAM_cssId;
    if (cssContent != null && themeVersion == HA_themeVersion) {
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
    var string = '@mixin fill-rgba($color, $opacity: 0.3) { fill: rgba($color, $opacity); }';
    for (var i in obj) {
        if (obj[i].val != null) {
            string += "\n" + HAM_customRulesObj[i].variable + ": " + obj[i].val + ";";
            for (var j in HAM_customRulesObj[i].pattern) {
                string += "\n" + HAM_customRulesObj[i].pattern[j];
            }
        }
    }
    return string;
}

var HAM_customRulesObj = {
    'SVGplot.l0': { type: 'colorPicker', pattern: [
        '.SVGplot.l0 { stroke: $SVGplot__l0 !important; }',
        '.SVGplot.l0fill { stroke: $SVGplot__l0 !important; @include fill-rgba($SVGplot__l0); }',
        '.SVGplot.l0dot { stroke: $SVGplot__l0 !important; }',
        '.SVGplot.l0fill_stripe { stroke: $SVGplot__l0 !important; }',
        '.SVGplot.l0fill_gyr { stroke: $SVGplot__l0 !important; }',
        'text.SVGplot.l0 { fill: $SVGplot__l0 !important; stroke: none !important; }',
        'text.SVGplot.l0fill { fill: $SVGplot__l0 !important; stroke: none !important; }',
        'text.SVGplot.l0dot { fill: $SVGplot__l0 !important; stroke: none !important; }',
        'text.SVGplot.l0fill_stripe { fill: $SVGplot__l0 !important; stroke: none !important; }',
        'text.SVGplot.l0fill_gyr { fill: $SVGplot__l0 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l0', val: null },
    'SVGplot.l1': { type: 'colorPicker', pattern: [
        '.SVGplot.l1{ stroke: $SVGplot__l1 !important; }',
        '.SVGplot.l1fill { stroke: $SVGplot__l1 !important; @include fill-rgba($SVGplot__l1); }',
        '.SVGplot.l1dot { stroke: $SVGplot__l1 !important; }',
        '.SVGplot.l1fill_stripe { stroke: $SVGplot__l1 !important; }',
        'text.SVGplot.l1 { fill: $SVGplot__l1 !important; stroke: none !important; }',
        'text.SVGplot.l1fill { fill: $SVGplot__l1 !important; stroke: none !important; }',
        'text.SVGplot.l1dot { fill: $SVGplot__l1 !important; stroke: none !important; }',
        'text.SVGplot.l1fill_stripe { fill: $SVGplot__l1 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l1', val: null },
    'SVGplot.l2': { type: 'colorPicker', pattern: [
        '.SVGplot.l2 { stroke: $SVGplot__l2 !important; }',
        '.SVGplot.l2fill { stroke: $SVGplot__l2 !important; @include fill-rgba($SVGplot__l2); }',
        '.SVGplot.l2dot { stroke: $SVGplot__l2 !important; }',
        'text.SVGplot.l2 { fill: $SVGplot__l2 !important; stroke: none !important; }',
        'text.SVGplot.l2fill { fill: $SVGplot__l2 !important; stroke: none !important; }',
        'text.SVGplot.l2dot { fill: $SVGplot__l2 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l2', val: null },
    'SVGplot.l3': { type: 'colorPicker', pattern: [
        '.SVGplot.l3 { stroke: $SVGplot__l3 !important; }',
        '.SVGplot.l3fill { stroke: $SVGplot__l3 !important; @include fill-rgba($SVGplot__l3); }',
        '.SVGplot.l3dot { stroke: $SVGplot__l3 !important; }',
        'text.SVGplot.l3 { fill: $SVGplot__l3 !important; stroke: none !important; }',
        'text.SVGplot.l3fill { fill: $SVGplot__l3 !important; stroke: none !important; }',
        'text.SVGplot.l3dot { fill: $SVGplot__l3 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l3', val: null },
    'SVGplot.l4': { type: 'colorPicker', pattern: [
        '.SVGplot.l4 { stroke: $SVGplot__l4 !important; }',
        '.SVGplot.l4fill { stroke: $SVGplot__l4 !important; @include fill-rgba($SVGplot__l4); }',
        '.SVGplot.l4dot { stroke: $SVGplot__l4 !important; }',
        'text.SVGplot.l4 { fill: $SVGplot__l4 !important; stroke: none !important; }',
        'text.SVGplot.l4fill { fill: $SVGplot__l4 !important; stroke: none !important; }',
        'text.SVGplot.l4dot { fill: $SVGplot__l4 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l4', val: null },
    'SVGplot.l5': { type: 'colorPicker', pattern: [
        '.SVGplot.l5 { stroke: $SVGplot__l5 !important; }',
        '.SVGplot.l5fill { stroke: $SVGplot__l5 !important; @include fill-rgba($SVGplot__l5); }',
        '.SVGplot.l5dot { stroke: $SVGplot__l5 !important; }',
        'text.SVGplot.l5 { fill: $SVGplot__l5 !important; stroke: none !important; }',
        'text.SVGplot.l5fill { fill: $SVGplot__l5 !important; stroke: none !important; }',
        'text.SVGplot.l5dot { fill: $SVGplot__l5 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l5', val: null },
    'SVGplot.l6': { type: 'colorPicker', pattern: [
        '.SVGplot.l6 { stroke: $SVGplot__l6 !important; }',
        '.SVGplot.l6fill { stroke: $SVGplot__l6 !important; @include fill-rgba($SVGplot__l6); }',
        '.SVGplot.l6dot { stroke: $SVGplot__l6 !important; }',
        'text.SVGplot.l6 { fill: $SVGplot__l6 !important; stroke: none !important; }',
        'text.SVGplot.l6fill { fill: $SVGplot__l6 !important; stroke: none !important; }',
        'text.SVGplot.l6dot { fill: $SVGplot__l6 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l6', val: null },
    'SVGplot.l7': { type: 'colorPicker', pattern: [
        '.SVGplot.l7 { stroke: $SVGplot__l7 !important; }',
        '.SVGplot.l7fill { stroke: $SVGplot__l7 !important; @include fill-rgba($SVGplot__l7); }',
        '.SVGplot.l7dot { stroke: $SVGplot__l7 !important; }',
        'text.SVGplot.l7 { fill: $SVGplot__l7 !important; stroke: none !important; }',
        'text.SVGplot.l7fill { fill: $SVGplot__l7 !important; stroke: none !important; }',
        'text.SVGplot.l7dot { fill: $SVGplot__l7 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l7', val: null },
    'SVGplot.l8': { type: 'colorPicker', pattern: [
        '.SVGplot.l8 { stroke: $SVGplot__l8 !important; }',
        '.SVGplot.l8fill { stroke: $SVGplot__l8 !important; @include fill-rgba($SVGplot__l8); }',
        '.SVGplot.l8dot { stroke: $SVGplot__l8 !important; }',
        'text.SVGplot.l8 { fill: $SVGplot__l8 !important; stroke: none !important; }',
        'text.SVGplot.l8fill { fill: $SVGplot__l8 !important; stroke: none !important; }',
        'text.SVGplot.l8dot { fill: $SVGplot__l8 !important; stroke: none !important; }'
    ], variable: '$SVGplot__l8', val: null },
    'svg.border': { type: 'colorPicker', pattern: [
        'svg .border { stroke: $svg__border !important; }'
    ], variable: '$svg__border', val: null },
    'svg.background': { type: 'colorPicker', pattern: [
        'svg .border { fill: $svg__background !important; }'
    ], variable: '$svg__background', val: null },
}