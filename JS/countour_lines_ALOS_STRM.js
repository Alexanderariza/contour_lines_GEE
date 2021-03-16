// Creating contour lines from STRM and ALOS DEMs in Google Earth Engine by Alexander Ariza. Visiting Scientist. 
// UN-SPIDER Programme 2020
//**************************************************************************************************************
// Add features of Area of Interes (NEPAL)
var AOI = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[83.89608528065132, 28.276983860791983],
          [83.89608528065132, 28.103897569894585],
          [84.14808418201851, 28.103897569894585],
          [84.14808418201851, 28.276983860791983]]], null, false);

// Add ALOS DSM: Global 30m

var dataset = ee.ImageCollection('JAXA/ALOS/AW3D30/V3_2');

var elevation = dataset.select('DSM')
                .filterBounds(AOI);
var elevationVis = {
  min: 0,
  max: 5000,
  palette: ['0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff']
};

// Reproject an image mosaic using a projection from one of the image tiles,
// rather than using the default projection returned by .mosaic().
var proj = elevation.first().select(0).projection();
var slopeReprojected =  (elevation.mosaic()
                             .setDefaultProjection(proj));

// Reduce the collection with a median reducer.
var dem = slopeReprojected.reduce(ee.Reducer.mean());

Map.addLayer(dem.clip(AOI), elevationVis, 'DEM ALOS');
Map.centerObject(AOI, 13);

// Remap values.
var demclass = ee.Image(1)
          .where(dem.gt(0).and(dem.lte(500)), 2)
          .where(dem.gt(500).and(dem.lte(600)), 3)
          .where(dem.gt(600).and(dem.lte(700)), 4)
          .where(dem.gt(700).and(dem.lte(800)), 5)
          .where(dem.gt(800).and(dem.lte(900)), 6)
          .where(dem.gt(900).and(dem.lte(1000)), 7)
          .where(dem.gt(1000).and(dem.lte(1100)), 8)
          .where(dem.gt(1100).and(dem.lte(1200)), 9)
          .where(dem.gt(1200).and(dem.lte(1300)), 10)
          .where(dem.gt(1300).and(dem.lte(1400)), 11)
          .where(dem.gt(1400).and(dem.lte(1500)), 12)
          .where(dem.gt(1500).and(dem.lte(1600)), 13)
          .where(dem.gt(1600).and(dem.lte(1700)), 14)
          .where(dem.gt(1700).and(dem.lte(1800)), 15)
          .where(dem.gt(1800).and(dem.lte(1900)), 16)
          .where(dem.gt(1900).and(dem.lte(2000)), 17);
          
Map.addLayer(demclass.clip(AOI), {min: 1, max: 17, palette: ['black', 'white']}, 'elevationclass ALOS', false);

// Define a boxcar or low-pass kernel.
var boxcar = ee.Kernel.square({
  radius: 3, units: 'pixels', normalize: true
});

// Smooth the image by convolving with the boxcar kernel.
var smooth = demclass.convolve(boxcar);
Map.addLayer(smooth.clip(AOI), {min: 1, max: 17, palette: ['black', 'white']}, 'smooth ALOS', false);

// Define arbitrary thresholds on the DEM image
var zones = demclass;
zones = zones.updateMask(zones.neq(0));

// Convert DEM zones to thresholds in vectors
var vectors = zones.addBands(demclass).reduceToVectors({
  geometry: AOI,
  scale: 30,
  geometryType: 'polygon',
  eightConnected: false,
  labelProperty: 'zone',
  reducer: ee.Reducer.mean()
});

// Add the vectors to the map
var display = ee.Image(0).updateMask(0).paint(vectors, '000000', 3);
Map.addLayer(display, {palette: 'ff0000'}, 'contour lines ALOS', false);

// Export the FeatureCollection to a KML file.
Export.table.toDrive({
  collection: vectors,
  description:'contour lines ALOS',
  fileFormat: 'KML'
});

//**************contour lines from SRTM NASA**************

// Add raster.
var elev = ee.Image("USGS/SRTMGL1_003");

// Get elevation.
var strmelevation = elev.select('elevation');
 
                 
// Remap values.
var slopereclass = ee.Image(1)
          .where(strmelevation.gt(0).and(strmelevation.lte(500)), 2)
          .where(strmelevation.gt(500).and(strmelevation.lte(600)), 3)
          .where(strmelevation.gt(600).and(strmelevation.lte(700)), 4)
          .where(strmelevation.gt(700).and(strmelevation.lte(800)), 5)
          .where(strmelevation.gt(800).and(strmelevation.lte(900)), 6)
          .where(strmelevation.gt(900).and(strmelevation.lte(1000)), 7)
          .where(strmelevation.gt(1000).and(strmelevation.lte(1100)), 8)
          .where(strmelevation.gt(1100).and(strmelevation.lte(1200)), 9)
          .where(strmelevation.gt(1200).and(strmelevation.lte(1300)), 10)
          .where(strmelevation.gt(1300).and(strmelevation.lte(1400)), 11)
          .where(strmelevation.gt(1400).and(strmelevation.lte(1500)), 12)
          .where(strmelevation.gt(1500).and(strmelevation.lte(1600)), 13)
          .where(strmelevation.gt(1600).and(strmelevation.lte(1700)), 14)
          .where(strmelevation.gt(1700).and(strmelevation.lte(1800)), 15)
          .where(strmelevation.gt(1800).and(strmelevation.lte(1900)), 16)
          .where(strmelevation.gt(1900).and(strmelevation.lte(2000)), 17);
          
Map.addLayer(slopereclass.clip(AOI), {min: 1, max: 17, palette: ['black', 'white']}, 'elevationclass', false);

////////////////
// Define a boxcar or low-pass kernel.
var boxcar = ee.Kernel.square({
  radius: 3, units: 'pixels', normalize: true
});

// Smooth the image by convolving with the boxcar kernel.
var smooth = slopereclass.convolve(boxcar);
Map.addLayer(smooth.clip(AOI), {min: 1, max: 9, palette: ['black', 'white']}, 'smooth STRM', false);

/////////////////////////////////////////////////////////////////////////

// Define arbitrary thresholds on the STRM image
var zones = slopereclass;
zones = zones.updateMask(zones.neq(0));

// Convert DEM zones to thresholds in vectors
var vectors = zones.addBands(strmelevation).reduceToVectors({
  geometry: AOI,
  scale: 30,
  geometryType: 'polygon',
  eightConnected: false,
  labelProperty: 'zone',
  reducer: ee.Reducer.mean()
});

// Add the vectors to the map
var display = ee.Image(0).updateMask(0).paint(vectors, '000000', 3);
Map.addLayer(display, {palette: 'ff0000'}, 'contour lines STRM');

/////////////////////////////////////////////
// Export the FeatureCollection to a KML file.
Export.table.toDrive({
  collection: vectors,
  description:'contour lines ALOS',
  fileFormat: 'KML'
});