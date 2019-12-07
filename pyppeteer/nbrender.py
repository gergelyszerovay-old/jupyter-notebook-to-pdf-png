# Copyright: Gergely Szerovay, 2019
# Licensed under the Apache License, version 2.0.

# 96 dpi

import asyncio
import pyppeteer
import sys
import os

def usage():
    print("USAGE:\npython nbrender.py ./notebook.html notebook.pdf\nOR\npython nbrender.py ./notebook.html notebook.png")

async def main():
    if len(sys.argv) != 3:
        usage()
        return
    
    htmlFile = sys.argv[1]
    outputFile = sys.argv[2]
    outputFileExt = outputFile[-4:]
    
    browser = await pyppeteer.launch()
    page = await browser.newPage()
    await page.goto('file://' + os.path.realpath(htmlFile))
    
    await page.setViewport({'width':1920, 'height': 100, 'deviceScaleFactor': 1})

    
    dimensions = await page.evaluate('''() => {
        return {
            deviceScaleFactor: window.devicePixelRatio,
            width: document.body.scrollWidth,
            height: document.body.scrollHeight
        }
    }''')

    pageHeightIn = (dimensions['height'] + 96 * 2) / 96
    print(f'Device scale factor: {dimensions["deviceScaleFactor"]}');
    print(f'Page width: {dimensions["width"]}px');
    print(f'Page height: {dimensions["height"]}px');
    
    if outputFileExt == '.png':
        await page.screenshot({'path': outputFile, 'fullPage': True})
    
    elif outputFileExt == '.pdf':          
        print(f'Page height: {pageHeightIn:.2f}in');
        if pageHeightIn > 200:
            print("\nWARNING: A page in a PDF document must be smaller than 200 inches.\n")

        await page.pdf({
            'path': outputFile,
            'printBackground': True,
            'margin': {'left': 0, 'top':0, 'right':0, 'bottom': 0},
            'width': 1920,
            'height': dimensions['height'] + 2 * 96
        })
    else:
        print('Invalid output file type, only .pdf and .png supported.')
    
    await browser.close()

asyncio.get_event_loop().run_until_complete(main())
