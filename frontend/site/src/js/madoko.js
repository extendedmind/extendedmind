var fs = require('fs');
var mkdirp = require('mkdirp');
var madokoDriver = require('../node_modules/madoko/lib/driver.js');
var madokoMath = require('../node_modules/madoko/lib/mathStaticRun.js');
var madokoRunners = madokoDriver.Runners(madokoMath.runPdfLaTeX,
                                         madokoMath.runBibtex,
                                         madokoMath.runMathStatic);
var madokoOptions = require('../node_modules/madoko/lib/options.js');
var jsdom = require('jsdom').jsdom;

function getUnprocessedMadokoHtml(handle, path, madokoItem, bibliographyItem, bibliographyPath, callback){
  var workPath = '/tmp/madoko/' + handle + '/' + path;
  mkdirp(workPath, function(err){
    if (err){
      callback(err);
    }else{
      var madokoContent = 'Title : ' + madokoItem.note.title + '\n' + madokoItem.note.content;
      if (bibliographyItem && bibliographyItem.note && bibliographyItem.note.content &&
          bibliographyItem.note.content.length && bibliographyItem.note.format === 'bibtex'){
        var bibFilePath = workPath + '/bibliography.bib';
        fs.writeFile(bibFilePath, bibliographyItem.note.content);
        madokoContent = madokoContent.replace(bibliographyPath, 'bibliography.bib');
      }
      var inputFileName = path + '.md';
      var opts = madokoOptions.parseOptions('--pdf --odir=' + workPath);
      opts.unJust.installDir = opts.unJust.installDir + '/node_modules/madoko/lib';
      var outName = madokoDriver.outputName(inputFileName, opts.unJust);
      var madokoHtml;

      madokoDriver.processContent(inputFileName, outName, madokoContent,
                                  opts.unJust, true, madokoRunners,
        function(outText){
          callback(null, outText);
        });
    }
  });
}

function getProcessedMadokoHtml(handle, path, madokoItem, bibliographyItem, bibliographyPath, callback){
  getUnprocessedMadokoHtml(handle, path, madokoItem, bibliographyItem,
                                               bibliographyPath, function(err, outText){
    if (err){
      callback(err);
    }else{
      var madokoDocument = jsdom(outText);
      var bodyElement = madokoDocument.getElementsByTagName("body")[0];
      var headerElement = madokoDocument.createElement("header");

      // TODO: Add extended mind logo to header
      bodyElement.insertBefore(headerElement, bodyElement.firstChild);

      var footerElement = madokoDocument.createElement("footer");
      bodyElement.appendChild(footerElement);
      // TODO: Add author and share links to footer

      var titleAuthorElement = madokoDocument.getElementsByClassName('authorrow')[0];
      var authorColumnElement = titleAuthorElement.getElementsByClassName('author column')[0];
      var downloadPdfElement = madokoDocument.createElement("a");
      downloadPdfElement.setAttribute('href', '/our/' + handle + '/' + path + '/pdf');
      downloadPdfElement.setAttribute('class', 'localref');
      var textnode = madokoDocument.createTextNode("Download PDF");
      downloadPdfElement.appendChild(textnode)
      authorColumnElement.appendChild(downloadPdfElement);
      callback(null, madokoDocument.documentElement.innerHTML);
    }
  });
}

module.exports = {
  getMadokoBibliographyPath: function(madokoItem){
    if (madokoItem.note && madokoItem.note.content && madokoItem.note.content.length){
      var contentLines = madokoItem.note.content.split('\n');
      for(var i = 0;i<contentLines.length;i++){
        // Only look through metadata lines where value is delimited with ' : '
        if (contentLines[i].indexOf(':') === -1) break;
        var metadataLine = contentLines[i];
        if (metadataLine.indexOf('Bib') === 0 && metadataLine.indexOf('Bib Style') === -1){
          // This is the bib metadata line, try to get the bibliography
          var valueStarts = metadataLine.indexOf(':');
          if (valueStarts < metadataLine.length - 1){
            return metadataLine.substr(valueStarts + 1,
                                      metadataLine.length - (valueStarts + 1)).trim();
          }
        }
      }
    }
  },
  getMadokoHtml: function(handle, path, madokoItem, bibliographyItem, bibliographyPath) {
    // Return a thunk
    return function(callback){
      getProcessedMadokoHtml(handle, path, madokoItem, bibliographyItem, bibliographyPath, callback);
    };
  },
  getMadokoPDFPath: function(handle, path) {
    return '/tmp/madoko/' + handle + '/' + path + '/' + path + '.pdf';
  }
};
