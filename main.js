const { app, BrowserWindow, Menu, ipcMain, ipcRenderer, shell } = require("electron")
const path = require('path');
const url = require('url');
const shapefile = require('shapefile');
const ArcGIS = require('terraformer-arcgis-parser');
const fs = require('fs');
const os = require('os');



// if all app windows close, close app
app.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    app.quit();
  }
});

// create browser window
app.on("ready", () => {
  let mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, '/../assets/images/512x512.png')
  });
  mainWindow.setPosition(10, 25);
  mainWindow.show();
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
// can close main window, yet app runs in case other windows are open.
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

// access to Chrom dev tools. remove when going to production

  const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));


  const menu = Menu.buildFromTemplate([
        {
          label: 'Menu',
          submenu: [
              {
                  label: 'Quit',
                  accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                  click() {
                    app.quit()
                  }
              }
          ]
        }
    ]);

// fixes menu differences in operating systems. Need to implement.
/*if (process.platform === 'darwin') {
  menu.unshift({});
}


Menu.setApplicationMenu(menu);
*/

  // ipc processes when shapefile is uploaded
  ipcMain.on("upload-shp", (event, arg) => {
    const results = [];
    shapefile.open(arg)
      .then(source => source.read()
        .then(function log(result) {
          if (result.done) {
            mainWindow.webContents.send("load-shp", results);
          }
          else {
            results.push(ArcGIS.convert(result.value));
            return source.read().then(log);
          }
        }))
      .catch(error => console.error(error.stack));
  });


  ipcMain.on('print-to-pdf', function(event){
    const pdfPath = path.join(os.tmpdir(), 'print.pdf');
    const win = BrowserWindow.fromWebContents(event.sender);


  function pdfSettings () {
    var options = {
        marginsType: 1,
        pageSize: "A4",
        printBackground: false,
        printSelectionOnly: false,
        landscape: true
  };
return options;
}


    win.webContents.printToPDF({
      pageSize:
      {
        width: '1920px',
        height: '1080px',
        landscape: true }
      },

      function(error, data) {
      if(error) return console.log(error.message);

      fs.writeFile(pdfPath, data, function(err) {
        if(err) return console.log(err.message);
        shell.openExternal('file://' + pdfPath);
        event.sender.send('wrote-pdf', pdfPath);
      })
    })
  });


});
