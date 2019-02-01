define(['qlik', './extension-properties', './js/tree', 'css!./css/tree.css'], function(
  qlik,
  extension_properties,
  tree
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
    // Property panel
    definition: extension_properties,
    paint: function($element, layout) {
      // debugger;

      // Declaring global variables
      var app = qlik.currApp();
      // var _this = this;

      // Check if all values are correctly set
      if (
        !layout.properties.treeStructure.nodeName ||
        !layout.properties.treeStructure.nodeDepth ||
        !layout.properties.treeStructure.nodeID ||
        !layout.properties.treeStructure.parentNodeID
      ) {
        var html_text =
          '<h1 style="font-size: 150%;">Please make sure you have correctly set up all the fields that define the Tree Structure.</h1>';

        html_text += '<br />This extension requires the following information:<br /><br />';
        if (!layout.properties.treeStructure.nodeName) {
          html_text += '<b style="color: #AD0000">';
        } else {
          html_text += '<b style="color: #1A8C27">';
        }
        html_text += 'Node Name:</b> This is the display name that will be representing each node of the tree<br />';
        if (!layout.properties.treeStructure.nodeDepth) {
          html_text += '<b style="color: #AD0000">';
        } else {
          html_text += '<b style="color: #1A8C27">';
        }
        html_text += 'Node Depth:</b> This is the depth level of the node in the tree<br />';
        if (!layout.properties.treeStructure.nodeID) {
          html_text += '<b style="color: #AD0000">';
        } else {
          html_text += '<b style="color: #1A8C27">';
        }
        html_text += 'Node ID:</b> This is the numeric ID that is related with the specified <i>Node Name</i><br />';
        if (!layout.properties.treeStructure.parentNodeID) html_text += '<b style="color: #AD0000">';
        else {
          html_text += '<b style="color: #1A8C27">';
        }
        html_text += 'Parent Node ID:</b> This is the numeric ID that identifies the parent of the node<br /><br />';
        html_text +=
          'The use of the Hierarchy Function to prepare this information is highly recommended. For more info click <a href="http://help.qlik.com/sense/2.1/en-US/online/#../Subsystems/Hub/Content/Scripting/ScriptPrefixes/Hierarchy.htm" target="_blank">here</a>';
        $element.html(html_text);
      } else {
        var treeProperties = {
          treeStructure: layout.properties.treeStructure,
        };

        // FIXME: Add later support
        var qSortCriteriasContents = {
          qSortByNumeric: treeProperties.treeStructure.nodeDepthSort == 'Ascending' ? 1 : -1,
        };

        app.createCube(
          {
            qDimensions: [
              {
                qDef: {
                  qFieldDefs: ['=' + treeProperties.treeStructure.nodeDepth],
                  // FIXME: Add later support
                  qSortCriterias: [qSortCriteriasContents],
                },
              },
              { qDef: { qFieldDefs: ['=' + treeProperties.treeStructure.nodeID] } },
              { qDef: { qFieldDefs: ['=' + treeProperties.treeStructure.parentNodeID] } },
              { qDef: { qFieldDefs: ['=' + treeProperties.treeStructure.nodeName] } },
            ],
            qMeasures: [{ qDef: { qDef: '1' } }],
            qInitialDataFetch: [{ qHeight: 1000, qWidth: 5 }],
          },
          function(reply) {
            var element = launchTree(reply, $element, 'tree' + layout.qInfo.qId, treeProperties);
            addEventsChart(element);
          }
        );
      }
    },
  };
});

function launchTree(treeData, element, object_id, treeProperties, _this, app) {
  // Check launch tree properties
  // debugger;
  var maxDepth = treeData.qHyperCube.qDataPages[0].qMatrix[treeData.qHyperCube.qSize.qcy - 1][0].qText;
  var maxDepthExpected = 0;
  if (treeData.qHyperCube.qSize.qcy > 1)
    maxDepthExpected = treeData.qHyperCube.qDataPages[0].qMatrix[treeData.qHyperCube.qSize.qcy - 2][0].qText;
  var minDepth = treeData.qHyperCube.qDataPages[0].qMatrix[0][0].qText;
  var unordered_leafs = new Array();
  var node_id = 'global leaf #';
  var iterator = 0;
  var tree_depth, row_nr;

  var load_tree = true;

  //some check-ups before loading the tree
  if (treeData.qHyperCube.qDataPages[0].qMatrix.length == 1) {
    if (
      treeData.qHyperCube.qDataPages[0].qMatrix[0][0].qIsNull ||
      treeData.qHyperCube.qDataPages[0].qMatrix[0][1].qIsNull
    ) {
      load_tree = false;
    }
  }
  if (isNaN(maxDepth)) load_tree = false;

  if (isNaN(maxDepth) && !isNaN(maxDepthExpected)) {
    //specifying expected max depth. If nodes are missing comment
    load_tree = true;
    maxDepth = maxDepthExpected;
  }

  //ok to load the hypercube for the tree
  if (load_tree) {
    for (tree_depth = 1; tree_depth <= maxDepth; tree_depth++) {
      //getting to the tree level
      for (row_nr = 0; row_nr < treeData.qHyperCube.qSize.qcy; row_nr++) {
        //iterating rows to create the tree
        if (treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][0].qText == tree_depth) {
          var child = new node(
            node_id + iterator,
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][1].qText, //element_id
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][2].qText, //parent_id
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][3].qText, //name+
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][4].qText, //measure
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][0].qText, //depth
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][3].qElemNumber
          ); //name's qElement

          unordered_leafs.push(child);
          iterator++;
        }
      }
    }

    var tree = growTree(unordered_leafs, maxDepth, minDepth);

    var html = renderChart(tree, element, object_id, treeProperties);
    return html;
  } else {
    //something is missing, better not load the hypercube
    $noDataDiv = $(document.createElement('div'));
    element.empty();
    element.append($noDataDiv);

    $noDataHeader = $(document.createElement('h1'));
    $noDataDiv.append($noDataHeader);
    $noDataHeader.text('Warning');
    $noDataHeader.css('font-size', '150%');
    $noDataHeader.css('color', '#FB8405');

    $noDataText = $(document.createElement('p'));
    $noDataDiv.append($noDataText);
    $noDataText.text('There is no information available to display or dataset is incorrect');
  }
}

function renderChart(tree, element, object_id, treeProperties) {
  // Recursive function to generate HTML from tree
  function listHtml(object, html) {
    // If Array (i.e. parent)
    if (object instanceof Array) {
      //... and call self for every object
      for (var i = 0; i < object.length; i++) {
        html = listHtml(object[i], html);
      }
      return html;
    } else if (object instanceof Object) {
      var objId = object.name + '-' + object.depth;
      var objectKeys = Object.keys(object);
      var hasChildren = false;
      // Check if our object has children
      for (var j = 0; j < objectKeys.length; j++) {
        if (objectKeys[j] === 'children' && object[objectKeys[j]] instanceof Array) {
          hasChildren = true;
          break;
        }
      }
      if (hasChildren) {
        html += '<li class="hierarchy-item" data-value="' + object.qElemNumber + '">\n';
        html +=
          '<span id="hierarchy-id-' +
          object.qElemNumber +
          '" class="hierarchy-caret hierarchy-name" >' +
          object.name +
          '</span>\n';
        html += '<ul class="hierarchy-nested">\n';
        //... and call self for every object
        html = listHtml(object.children, html);
        html += '</ul>\n';
        html += '</li>\n';
        return html;
      } else {
        // Add leaf
        html +=
          '<li id="hierarchy-id-' +
          object.qElemNumber +
          '" class="hierarchy-item hierarchy-leaf" data-value="' +
          object.qElemNumber +
          '">' +
          '<span id="hierarchy-id-' +
          object.qElemNumber +
          '" class="hierarchy-name">' +
          object.name +
          '</span>' +
          '</li>\n';
        return html;
      }
    }
  }
  $html = $(document.createElement('div'));
  $html.attr('id', object_id);
  $html.addClass('hierarchyFilterPane');
  $(element).empty();
  $(element).append($html);

  var html = '<ul id="hierarchyFilerPane">';
  html = listHtml(tree, html);
  html += '</ul>';

  $(element).html(html);

  return $(element);
}

function addEventsChart(element) {
  function selectData(node) {
    var names = [];
    var nameIdx = [];
    var getNodeNames = function(node) {
      names.push({
        qText: node.name,
      });
      nameIdx.push(node.qElemNumber);
      if (node.children) {
        for (var i = 0; i != node.children.length; i++) {
          getNodeNames(node.children[i]);
        }
      }
      return names;
    };
    var selectedElements = getNodeNames(node);
    var nodeNameField = app.field(treeProperties.treeStructure.nodeName);
    nodeNameField.clear();
    nodeNameField.selectValues(selectedElements, false, false);
    // debugger;
  }

  function findNodeInTree(node, qElemNbr) {
    if (node instanceof Array) {
      var result = null;
      for (var i = 0; i < node.length; i++) {
        result = findNodeInTree(node[i], qElemNbr);
        if (result) return result;
      }
      return result;
    } else if (node instanceof Object) {
      if (node.qElemNumber === qElemNbr) {
        return node;
      } else if (node.hasOwnProperty('children')) {
        return findNodeInTree(node.children, qElemNbr);
      }
    }
  }

  $(element)
    .find('.hierarchy-name')
    .hover(
      function(event) {
        if (event.currentTarget.id.length > 0) {
          $('#' + event.currentTarget.id).css({
            cursor: 'pointer',
            'background-color': '#D3D3D3',
          });
        }
      },
      function(event) {
        if (event.currentTarget.id.length > 0) {
          $('#' + event.currentTarget.id).css({
            cursor: 'none',
            'background-color': 'transparent',
          });
        }
      }
    );

  $(element)
    .find('.hierarchy-name')
    .click(function(event) {
      if (event.target.id.length > 0) {
        var element = $('#' + event.target.id);
        // debugger;
        // console.log('(event) Click. Is it clicked? ', $(this).hasClass('hierarchy-clicked'));
        if (element.hasClass('hierarchy-clicked')) {
          element.removeClass('hierarchy-clicked');
          if (element[0].hasAttribute('data-value')) {
            // Value is the same as qElementNum in tree
            var value = parseInt(element[0].getAttribute('data-value'), 10);
            var selectedNode = findNodeInTree(tree, value);
            selectData(selectedNode);
            // debugger;
            // FIXME: Selection coloring not working!!!
            // element[0].classList.toggle('hierarchy-selected');
          } else if (element[0].parentElement.hasAttribute('data-value')) {
            // Value is the same as qElementNum in tree
            var value = parseInt(element[0].parentElement.getAttribute('data-value'), 10);
            var selectedNode = findNodeInTree(tree, value);
            selectData(selectedNode);
            // debugger;
            // FIXME: Selection coloring not working!!!
            // element[0].classList.toggle('hierarchy-selected');
          }
        } else {
          element.addClass('hierarchy-clicked');
          setTimeout(
            function() {
              // debugger;
              if ($(this).hasClass('hierarchy-clicked')) {
                $(this).removeClass('hierarchy-clicked');

                var item = $(this)[0];
                var itemNested = item.parentElement.querySelector('.hierarchy-nested');
                // Can't expand leaf items
                if (item !== null && itemNested !== null) {
                  itemNested.classList.toggle('hierarchy-active');
                  item.classList.toggle('hierarchy-caret-down');
                }
              }
            }.bind(element),
            300
          );
        }
      }
    });
}
