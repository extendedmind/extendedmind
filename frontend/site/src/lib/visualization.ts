let gd;
try {
  gd = require("node-gd");
  console.info("support for generating images found");
} catch (e) {
  console.info("continuing without image support");
}

import * as fs from "fs";
import * as path from "path";

export class Visualization {
  constructor(private imagePath: string, private fontPath: string) {
    console.info("setting image path to: " + this.imagePath + " and font path to: " + this.fontPath);
  }

  public generateImageFromText(printText: string, id: string, modified: number): Promise<string> {
    const imagePath = this.imagePath;
    return new Promise((resolve, reject) => {

      // Check if this file has already been generated
      const fileName = id + "-" + modified + ".png";
      const fullFilePath = imagePath + "/" + fileName;
      fs.access(fullFilePath, (readErr) => {
        if (!readErr) {
          // We already have this file, most likely generated on another server and then synced here
          resolve(fileName);
        } else if (gd && gd.getGDVersion() >= "2.1.1") {
          const SIZE_HORIZONTAL: number = 1200;
          const SIZE_VERTICAL: number = 630;
          const SIZE_PADDING: number = 100;
          const MAX_FONT_SIZE: number = 120;
          const FONT_PIXEL_COEFFICIENT: number = 1.4;

          // Create blank new image in memory
          const img = gd.createSync(SIZE_HORIZONTAL, SIZE_VERTICAL);

          // Set background color
          img.colorAllocate(255, 255, 255);

          // Set text color
          const txtColor = img.colorAllocate(0, 0, 0);

          // Print words
          const printTextWords = printText.split(" ");

          // Create a new array where other words try to match the longest word
          const printLines = [printTextWords[0]];
          let startIndex = 1;
          const longestAllowedLineLength =
            Math.max(
              Math.floor(printText.length * (SIZE_VERTICAL / (SIZE_HORIZONTAL * 1.3))),
              25);

          while ((startIndex < printTextWords.length) &&
                ((printLines[0].length + printTextWords[startIndex].length + 1) <
                  longestAllowedLineLength)) {
            printLines[0] += " " + printTextWords[startIndex];
            startIndex++;
          }
          const longestLineLength = printLines[0].length;

          const fontSizeHorizontally: number =
            Math.floor(
              Math.min(SIZE_HORIZONTAL / longestLineLength * FONT_PIXEL_COEFFICIENT,
              MAX_FONT_SIZE));

          for (let i = startIndex; i < printTextWords.length; i++) {
            const latestPrintWord = printLines[printLines.length - 1];
            if ((latestPrintWord.length + printTextWords[i].length + 1) < longestLineLength) {
              printLines[printLines.length - 1] = latestPrintWord + " " + printTextWords[i];
            }else {
              printLines.push(printTextWords[i]);
            }
          }

          const fontSizeVertically =
            Math.floor(
              Math.min(
                (SIZE_VERTICAL - SIZE_PADDING * 2) / (printLines.length * FONT_PIXEL_COEFFICIENT),
                MAX_FONT_SIZE));
          const fontSize = Math.min(fontSizeHorizontally, fontSizeVertically);

          const distanceBetweenLines = Math.floor(fontSize * FONT_PIXEL_COEFFICIENT);
          const padding =
            fontSize +
            Math.max(
              Math.floor((SIZE_VERTICAL - (printLines.length * distanceBetweenLines)) / 2),
              SIZE_PADDING);
          for (let i = 0; i < printLines.length; i++) {
            // Render string in image
            const yCoord = padding + (i * distanceBetweenLines);
            img.stringFT(txtColor, this.fontPath, fontSize, 0, SIZE_PADDING, yCoord, printLines[i]);
          }

          // Write image buffer to disk
          img.savePng(fullFilePath, 1, (saveErr) => {
            img.destroy();
            if (saveErr) {
              reject(saveErr);
            } else {
              // Destroy image to clean memory
              resolve(fileName);
            }
          });
        }else {
          // Not possible to save files, just resolve with undefined file name
          resolve();
        }
      });
    });
  }
}
