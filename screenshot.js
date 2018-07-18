// take a screenshot
// what we need to take a screenshot

const desktopCapturer = ipcRenderer.desktopCapturer;
const electronScreen = ipcRenderer.screen;
const shell = ipcRenderer.shell;

const fs = ipcRenderer.fs;
const os = ipcRenderer.os;
const path = ipcRenderer.path;

/*
const electron = require('electron')
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const shell = electron.shell;

const fs = require('fs');
const os = require('os');
const path = require('path');
*/

const screenshot = document.getElementById('screen-shot');
const screenshotMsg = document.getElementById('screenshot-path');

  screenshot.addEventListener('click', function(event) {
  screenshotMsg.textContent = 'Gathering screens...';
  const thumbSize = determineScreenShot();
  let option = { types: ['screen'], thumbnailSize: thumbSize };

  desktopCapturer.getSources(option, function(error, sources){
    if(error) return console.log(error.message);

    sources.forEach(function(source) {
      if(source.name === 'Entire Screen' || source.name === 'Screen 1'){
        const screenshotPath = path.join(os.tmpdir(), 'screenshot.png');

        fs.writeFile(screenshotPath, source.thumbnail.toPng(), function(err){
          if(err) return console.log(err.message);

          shell.openExternal('file://' + screenshotPath);
          var message = 'Saved screenshot to: ' + screenshotPath;
          screenshotMsg.textContent = message;
        })
      }
    });
  });
});

function determineScreenShot() {
  const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
  const maxDimension = Math.max(screenSize.width, screenSize.height);
  return{
    width: maxDimension * window.devicePixelRatio,
    height: maxDimension * window.devicePixelRatio
  };
}
