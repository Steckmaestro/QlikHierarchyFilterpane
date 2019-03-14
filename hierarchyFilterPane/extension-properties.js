define([], function() {
  'use strict';

  var appearanceSection = {
    uses: 'settings',
  };

  var treeConfigurations = {
    type: 'items',
    component: 'expandable-items',
    label: 'Tree Configuration',
    items: {
      treeStructure: {
        type: 'items',
        label: 'Configuration options',
        items: {
          nodeName: {
            ref: 'properties.treeStructure.nodeName',
            label: 'Node Name',
            type: 'string',
            expression: '',
          },
          depth: {
            ref: 'properties.treeStructure.nodeDepth',
            label: 'Node Depth',
            type: 'string',
            expression: '',
          },
          depthSort: {
            ref: 'properties.treeStructure.nodeDepthSort',
            label: 'Node Depth Sort',
            type: 'string',
            component: 'dropdown',
            options: [
              {
                value: 'Ascending',
                label: 'Ascending',
              },
              {
                value: 'Descending',
                label: 'Descending',
              },
            ],
            defaultValue: 'Ascending',
          },
          nodeID: {
            ref: 'properties.treeStructure.nodeID',
            label: 'Node ID',
            type: 'string',
            expression: '',
          },
          parentNodeID: {
            ref: 'properties.treeStructure.parentNodeID',
            label: 'Parent Node ID',
            type: 'string',
            expression: '',
          },
          defineCollapseLevel: {
            ref: 'properties.treeStructure.defineCollapseLevel',
            label: 'Define a Default Collapse Level',
            type: 'boolean',
            component: 'switch',
            options: [{ value: true, label: 'Enabled' }, { value: false, label: 'Disabled' }],
            defaultValue: false,
          },
          collapseLevel: {
            ref: 'properties.treeStructure.collapseLevel',
            label: 'Default Collapse Level',
            type: 'integer',
            expression: '',
            defaultValue: 3,
            show: function(data) {
              return data.properties.treeStructure.defineCollapseLevel;
            },
          },
          ignoreSelections: {
            ref: 'properties.treeStructure.ignoreSelections',
            label: 'Ignore other selections',
            type: 'boolean',
            component: 'switch',
            options: [{ value: true, label: 'Enabled' }, { value: false, label: 'Disabled' }],
            defaultValue: false
          }
        },
      },
    },
  };

  return {
    type: 'items',
    component: 'accordion',
    items: {
      treeConfiguration: treeConfigurations,
      appearance: appearanceSection,
    },
  };
});
