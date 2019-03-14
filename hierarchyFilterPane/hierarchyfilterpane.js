define(['qlik', './extension-properties', './lib/tree', 'css!./css/tree.css'], function(
  qlik,
  extension_properties,
  tree
) {
  return {
    definition: extension_properties,
    paint: function($element, layout) {
      var app = qlik.currApp();
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

        var qIgnoreSelections = treeProperties.treeStructure.ignoreSelections;

        app.createCube(
          {
            qDimensions: [
              {
                qDef: {
                  qFieldDefs: ['=' + treeProperties.treeStructure.nodeDepth],
                  qSortCriterias: [qSortCriteriasContents],
                },
              },
              { qDef: { qFieldDefs: ['=' + treeProperties.treeStructure.nodeID] } },
              { qDef: { qFieldDefs: ['=' + treeProperties.treeStructure.parentNodeID] } },
              { qDef: { qFieldDefs: ['=' + treeProperties.treeStructure.nodeName] } },
            ],
            qMeasures: [{ qDef: { qDef: qIgnoreSelections ? 'count({1}1)' : '1'}}],
            qInitialDataFetch: [{ qHeight: 1000, qWidth: 5 }],
          },
          function(reply) {
            // Generate nodetree
            var tree = launchTree(reply, $element);
            // Generate render HTML
            var element = renderChart(tree, $element, treeProperties, 'tree' + layout.qInfo.qId);
            // Add eventlisteners
            addEventsToChart(element, tree, treeProperties, app);
          }
        );
      }
    },
  };
});

function launchTree(treeData, element) {
  var maxDepth = treeData.qHyperCube.qDimensionInfo[0].qMax;
  var maxDepthExpected = 0;
  if (treeData.qHyperCube.qSize.qcy > 1) {
    maxDepthExpected = treeData.qHyperCube.qDataPages[0].qMatrix[treeData.qHyperCube.qSize.qcy - 2][0].qText;
  }
  var minDepth = treeData.qHyperCube.qDimensionInfo[0].qMin;
  var unordered_leafs = new Array();
  var node_id = 'leaf #';
  var iterator = 0;
  var tree_depth, row_nr;
  var load_tree = true;

  //some check-ups before loading the tree
  if (treeData.qHyperCube.qDataPages[0].qMatrix.length === 1) {
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
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][3].qState, //selection state
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][1].qText, //element_id
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][2].qText, //parent_id
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][3].qText, //name
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][4].qText, //measure
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][0].qText, //depth
            treeData.qHyperCube.qDataPages[0].qMatrix[row_nr][3].qElemNumber
          ); //name's qElement
          unordered_leafs.push(child);
          iterator++;
        }
      }
    }
    return growTree(unordered_leafs);
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

function renderChart(tree, element, treeProperties, object_id) {
  // Check collapse
  var collapseLevel = (function() {
    if (treeProperties.treeStructure.defineCollapseLevel) {
      if (!isNaN(treeProperties.treeStructure.collapseLevel)) {
        return treeProperties.treeStructure.collapseLevel;
      } else {
        return null;
      }
    } else {
      return null;
    }
  })();

  // Recursive function to generate HTML from tree
  function listHtml(object, object_id, appendTo) {
    // If Array (i.e. parent)
    if (object instanceof Array) {
      //... and call self for every object
      for (var i = 0; i < object.length; i++) {
        listHtml(object[i], object_id, appendTo);
      }
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
        var $li = $('<li>', {
          class: 'hierarchy-item',
          'data-value': object.qElemNumber,
        });
        $li.appendTo($('#' + appendTo));

        // Add css class to expand if collapseLevel is set
        var expandObject = collapseLevel !== null && object.depth <= collapseLevel;
        var caretDownClass = expandObject ? ' hierarchy-caret-down' : '';
        // Add css class to make green if object is selected
        var hierarchySelectedClass = object.state === "S" ? ' hierarchy-item-selected' : '';

        var $span = $('<span>', {
          id: 'hierarchy-id-' + object.qElemNumber + '-' + object_id,
          class: 'hierarchy-caret hierarchy-name' + caretDownClass + hierarchySelectedClass,
        });
        $span.text(object.name);
        $span.appendTo($li);

        // Generate a new append id for child items
        var appendId = 'append-id-' + object.qElemNumber + '-' + object_id;
        var hierarchyActiveClass = expandObject ? ' hierarchy-active' : '';

        // Generate new list to hold child items
        var $ul = $('<ul>', {
          id: appendId,
          class: 'hierarchy-nested' + hierarchyActiveClass,
        });
        $ul.appendTo($li);

        //... and call self for every object
        listHtml(object.children, object_id, appendId);
      } else {
        // Add css class to make green if object is selected
        var hierarchySelectedClass = object.state === "S" ? ' hierarchy-item-selected' : '';

        // Add leaf
        var $li = $('<li>', {
          class: 'hierarchy-item hierarchy-leaf',
          'data-value': object.qElemNumber,
        });
        $li.appendTo($('#' + appendTo));

        var $span = $('<span>', {
          id: 'hierarchy-id-' + object.qElemNumber + '-' + object_id,
          class: 'hierarchy-name' + hierarchySelectedClass,
        });
        $span.text(object.name);
        $span.appendTo($li);
      }
    }
  }

  $html = $(document.createElement('div'));
  $html.attr('id', object_id);
  $html.addClass('hierarchyFilterPane');

  var hierarchyId = 'hierarchyFilterPane' + object_id;

  $(element).css('overflow', 'auto');

  $('<ul>', {
    id: hierarchyId,
  }).appendTo($html);

  $(element).empty();
  $(element).append($html);

  listHtml(tree, object_id, hierarchyId);

  return $(element);
}

function addEventsToChart(element, tree, treeProperties, app) {
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
    .click(function(event) {
      if (event.target.id.length > 0) {
        var $element = $('#' + event.target.id);
        if ($element.hasClass('hierarchy-clicked')) {
          $element.removeClass('hierarchy-clicked');
          // JQuery hack instead of hasAttribute using CSS selector
          if ($element.is('[data-value]')) {
            var value = parseInt($element.attr('data-value'), 10);
          } else if ($element.parent().is('[data-value]')) {
            var value = parseInt($element.parent().attr('data-value'), 10);
          }
          var selectedNode = findNodeInTree(tree, value);
          selectData(selectedNode);
        } else {
          $element.addClass('hierarchy-clicked');
          // bind element so it works with timeout
          setTimeout(
            function() {
              if ($(this).hasClass('hierarchy-clicked')) {
                $(this).removeClass('hierarchy-clicked');
                // Check if element is expandable (i.e. has caret class)
                if ($(this).hasClass('hierarchy-caret')) {
                  $(this).toggleClass('hierarchy-caret-down');
                  $(this)
                    .siblings('.hierarchy-nested')
                    .toggleClass('hierarchy-active');
                }
              }
            }.bind($element),
            300
          );
        }
      }
    });
}
