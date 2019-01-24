define(['qlik', './extension-properties'], function(
  qlik,
  extension_properties
) {
  return {
    initialProperties: {
      version: 1.0,
      qListObjectDef: {
        qShowAlternatives: true,
        qFrequencyMode: 'V',
        selectionMode: 'CONFIRM',
        qInitialDataFetch: [
          {
            qWidth: 2,
            qHeight: 50,
          },
        ],
      },
      selectionMode: 'CONFIRM',
    },
    support: {
      snapshot: true,
    },

    definition: extension_properties,

    paint: function($element, layout) {
      app = qlik.currApp();
    },
  };
});
