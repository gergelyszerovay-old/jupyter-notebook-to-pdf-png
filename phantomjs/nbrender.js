"use strict"

// Copyright: Gergely Szerovay, 2019
// Licensed under the Apache License, version 2.0.

var system = require('system'),
    page = require('webpage').create(),
    page2 = require('webpage').create(),
    htmlFile, outputFile, pageWidth2, pageHeightIn,
    dpi = 72,
    pageWidth = 1920,
    pageHeight = 100;

if (system.args.length < 3) {
    console.log('USAGE: phantomjs ./nbrender.js ./notebook.html notebook.pdf');
    phantom.exit(1);
} else {
    htmlFile = system.args[1];
    outputFile = system.args[2];

    page.paperSize = { width: pageWidth, height: pageHeight, margin: '0px' }
    page.viewportSize = { width: pageWidth, height: pageHeight };
    page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };

    page.open(htmlFile, function (status) {
        // calculate the height of the rendered page at viewport width = 1920px
        if (status !== 'success') {
            console.log('Unable to load the HTML file!');
            phantom.exit(1);
        } else {
            window.setTimeout(function () {
                console.log('Page opened.');
                pageHeight = page.evaluate(function(){
                    return document.body.scrollHeight;
                });
                pageHeight += dpi * 2; // add some more space
                // verify page width
                pageWidth2 = page.evaluate(function(){
                    return document.body.scrollWidth;
                });
                console.log('Page width: ' + pageWidth2 + 'px');
                console.log('Page height: ' + pageHeight + 'px');
                pageHeightIn = Math.round(pageHeight/dpi)
                console.log('Page height: ' + pageHeightIn + 'in');

                if (pageHeightIn > 200 && outputFile.substr(-4) === ".pdf") {
                    console.log("\nWARNING: A page in a PDF document must be smaller than 200 inches.\n")
                }

                // reopen the page with the calculated page height
                page2.paperSize = { width: pageWidth, height: pageHeight, margin: '0px' }
                page2.viewportSize = { width: pageWidth, height: pageHeight };
                page2.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };

                console.log('Rendering page...');
                page2.open(htmlFile, function (status) {
                    window.setTimeout(function () {
                        page2.render(outputFile);
                        console.log('Done.');
                        phantom.exit();
                    }, 3000);
                });
            }, 3000);
        }
    });
}
