'use strict'

const fs = require('fs-promise');
const mkdirp = require('mkdirp-then');
const madokoDriver = require('../node_modules/madoko/lib/driver.js');
const madokoMath = require('../node_modules/madoko/lib/mathStaticRun.js');
const madokoRunners = madokoDriver.Runners(madokoMath.runPdfLaTeX,
                                         madokoMath.runBibtex,
                                         madokoMath.runMathStatic);
const madokoOptions = require('../node_modules/madoko/lib/options.js');
const jsdom = require('jsdom').jsdom;

// Promisified Madoko call
function processMadokoContent(inputFileName, outName, madokoContent, opts, firstTime, madokoRunners, resolve){
  return new Promise(function(resolve, reject){
    madokoDriver.processContent(inputFileName, outName, madokoContent,
                                opts, firstTime, madokoRunners, resolve);
  });
}

async function getUnprocessedMadokoHtml(handle, path, madokoItem, bibliographyItem, bibliographyPath){
  const workPath = '/tmp/madoko/' + handle + '/' + path;
  await mkdirp(workPath);
  let madokoContent = 'Title : ' + madokoItem.note.title + '\n' + madokoItem.note.content;
  if (bibliographyItem && bibliographyItem.note && bibliographyItem.note.content &&
      bibliographyItem.note.content.length && bibliographyItem.note.format === 'bibtex'){
    const bibFilePath = workPath + '/bibliography.bib';
    await fs.writeFile(bibFilePath, bibliographyItem.note.content);
    madokoContent = madokoContent.replace(bibliographyPath, 'bibliography.bib');
  }
  const inputFileName = path + '.md';
  const opts = madokoOptions.parseOptions('--pdf --odir=' + workPath);
  opts.unJust.installDir = opts.unJust.installDir + '/node_modules/madoko/lib';
  const outName = madokoDriver.outputName(inputFileName, opts.unJust);
  return await processMadokoContent(inputFileName, outName, madokoContent, opts.unJust, true, madokoRunners);
}

async function getProcessedMadokoHtml(handle, path, madokoItem, bibliographyItem, bibliographyPath){
  const outText = await getUnprocessedMadokoHtml(handle, path, madokoItem, bibliographyItem, bibliographyPath);
  let madokoDocument = jsdom(outText);
  let bodyElement = madokoDocument.getElementsByTagName("body")[0];
  let headerElement = madokoDocument.createElement("header");

  // TODO: Add extended mind logo to header
  bodyElement.insertBefore(headerElement, bodyElement.firstChild);

  let footerElement = madokoDocument.createElement("footer");
  bodyElement.appendChild(footerElement);
  // TODO: Add author and share links to footer

  let titleAuthorElement = madokoDocument.getElementsByClassName('authorrow')[0];
  let authorColumnElement = titleAuthorElement.getElementsByClassName('author column')[0];
  let downloadPdfElement = madokoDocument.createElement("a");
  downloadPdfElement.setAttribute('href', '/our/' + handle + '/' + path + '/pdf');
  downloadPdfElement.setAttribute('class', 'localref');
  let textnode = madokoDocument.createTextNode("Download PDF");
  downloadPdfElement.appendChild(textnode)
  authorColumnElement.appendChild(downloadPdfElement);
  return madokoDocument.documentElement.innerHTML;
}

module.exports = {
  getMadokoBibliographyPath: function(madokoItem){
    if (madokoItem.note && madokoItem.note.content && madokoItem.note.content.length){
      const contentLines = madokoItem.note.content.split('\n');
      for(let i = 0;i<contentLines.length;i++){
        // Only look through metadata lines where value is delimited with ' : '
        if (contentLines[i].indexOf(':') === -1) break;
        const metadataLine = contentLines[i];
        if (metadataLine.indexOf('Bib') === 0 && metadataLine.indexOf('Bib Style') === -1){
          // This is the bib metadata line, try to get the bibliography
          const valueStarts = metadataLine.indexOf(':');
          if (valueStarts < metadataLine.length - 1){
            return metadataLine.substr(valueStarts + 1,
                                      metadataLine.length - (valueStarts + 1)).trim();
          }
        }
      }
    }
  },
  getMadokoHtml: async function(handle, path, madokoItem, bibliographyItem, bibliographyPath) {
    return getProcessedMadokoHtml(handle, path, madokoItem, bibliographyItem, bibliographyPath);
  },
  getMadokoPDFPath: function(handle, path) {
    return '/tmp/madoko/' + handle + '/' + path + '/' + path + '.pdf';
  }
};
