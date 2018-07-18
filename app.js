// use node.js request
const { ipcRenderer } = nodereq("electron");

// require esri tools so we can create our view, draw graphics for each feature, and drag and drop .shp file loader.
require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/geometry/Polygon",
  "esri/core/domUtils",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleFillSymbol"
], function (
  EsriMap, SceneView,
  Graphic,
  Point, Polygon,
  domUtils,
  SimpleMarkerSymbol,
  SimpleFillSymbol
) {
// create map, select basemap, initial view and zoom level
    const map = new EsriMap({
      basemap: "hybrid",
      ground: "world-elevation"
    });

    const view = new SceneView({
      container: "viewDiv",
      center: [-118.5833333333333, 34.75],
      zoom: 1,
      map: map,
      highlightOptions: {
        color: "#ff642e",
        haloOpacity: 1,
        fillOpacity: 0.25
}
    });

    const backdrop = document.getElementById("backdrop");
    const viewDiv = document.getElementById("viewDiv");

    view.then(() => domUtils.hide(backdrop));

// config and draw a symbol for each feature
    const fill = new SimpleFillSymbol({
      outline: {
        color: [255, 0, 0, 1]
      },
      color: [255, 165, 0, 0.25]
    });

    const marker = new SimpleMarkerSymbol({
      outline: {
        color: [255, 255, 255, 1]
      },
      color: [255, 165, 0, 1]
    });

    function fileDragHover(event) {
      event.stopPropagation();
      event.preventDefault();
      viewDiv.classList.add("dropping");
    }

    function fileDragHoverLeave(e) {
      e.stopPropagation();
      e.preventDefault();
      domUtils.hide(backdrop);
      viewDiv.classList.remove("dropping");
    }

    function toGraphics(feature) {

      let g;
      if (feature.geometry.x) {
        g = new Graphic({
          attributes: feature.attributes,
          geometry: new Point(feature.geometry),
          symbol: marker,
          popupTemplate: {
            title: "From Shapefile",
            content: "{*}"
          }
        })
      }
      else {
        g = new Graphic({
          attributes: feature.attributes,
          geometry: new Polygon(feature.geometry),
          symbol: fill,
          popupTemplate: {
            title: "From Shapefile",
            content: "{*}"
          }
        })
      }
      return g;
    }

    function addToMap(features) {
      const graphics = features.map(toGraphics);
      console.log(graphics);
      view.graphics.addMany(graphics);
      view.goTo(graphics).then(() => {
        domUtils.hide(backdrop);
      });
    }
// renderer process returns features
    ipcRenderer.on("load-shp", (event, features) => {
      console.log(event, features);
      return addToMap(features);
    });


    // when file is selected
    function fileSelectHandler(event) {
      // cancel event and hover styling
      event.stopPropagation();
      event.preventDefault();
      domUtils.show(backdrop);
      viewDiv.classList.remove("dropping");
      // get the FileList object
      const files = Array.from(event.target.files || event.dataTransfer.files);
      // look through all File objects and find the .shp file
      files.map(file => {
        const filepath = file.path.toString();
        if (filepath.includes(".shp")) {
          ipcRenderer.send("upload-shp", filepath);
        }
        else {
          alert("Only ShapeFiles ending in .shp can be dropped and viewed!");
          domUtils.hide(backdrop);
        }
      });
    }

// add event listeners to the viewDiv
    viewDiv.addEventListener("dragover", fileDragHover, false);
    viewDiv.addEventListener("dragleave", fileDragHoverLeave, false);
    viewDiv.addEventListener("drop", fileSelectHandler, false);
  });
