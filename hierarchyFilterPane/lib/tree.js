//create a new node object
function node(node_id, node_state, element_id, parent_id, name, measure, depth, qElemNumber) {
  return {
    node_id: node_id,
    node_state: node_state,
    element_id: element_id,
    parent_id: parent_id == '' ? null : parent_id,
    name: name,
    measure: measure,
    depth: depth,
    qElemNumber: qElemNumber,
    childs: [],
  };
}

//returns a full tree based on an array of leafs and the tree's maximum depth
function growTree(leafs) {
  // Clean leafs
  var cleanedLeafs = [];
  for (l = 0; l < leafs.length; l++) {
    cleanedLeafs.push(nodeJsonReady(leafs[l]));
  }
  //Get rootNodes (support for multiple root nodes)
  var rootNodes = findParentlessNodes(cleanedLeafs);

  console.log('Cleaned leafs: ', cleanedLeafs);

  //Attach rootNodes to tree
  var tree = [];

  //If we have nodes one level down we try to attach them to the parent;
  if (rootNodes.length > 0) {
    // console.log('Temp nodes: ', tempNodes);
    for (j = 0; j < rootNodes.length; j++) {
      var parent = rootNodes[j];
      tree.push(getNestedChildren(cleanedLeafs, parent.parentId));
    }
  }

  function getNestedChildren(arr, parent) {
    var out = [];
    for (var i in arr) {
      if (arr[i].parentId == parent) {
        var children = getNestedChildren(arr, arr[i].nodeId);

        if (children.length) {
          arr[i].children = children;
        }
        out.push(arr[i]);
      }
    }
    return out;
  }

  // Return tree
  return tree;

  function findParentlessNodes(nodes) {
    var parentlessNodes = [];
    for (n = 0; n < nodes.length; n++) {
      var foundParent = false;
      for (p = 0; p < nodes.length; p++) {
        if (nodes[n].parentId == nodes[p].nodeId) {
          foundParent = true;
        }
      }
      if (!foundParent) {
        //Only add one root node for every parent id
        var uniqueParent = true;
        for (t = 0; t < parentlessNodes.length; t++) {
          if (nodes[n].parentId == parentlessNodes[t].parentId) {
            uniqueParent = false;
          }
        }
        if (uniqueParent) {
          parentlessNodes.push(nodes[n]);
        }
      }
    }
    return parentlessNodes;
  }
  function nodeJsonReady(node) {
    if (node.childs.length > 0)
      return {
        name: node.name,
        state: node.node_state,
        nodeId: node.element_id,
        parentId: node.parent_id,
        children: node.childs,
        size: node.measure,
        depth: node.depth,
        qElemNumber: node.qElemNumber,
      };
    return {
      name: node.name,
      state: node.node_state,
      nodeId: node.element_id,
      parentId: node.parent_id,
      size: node.measure,
      depth: node.depth,
      qElemNumber: node.qElemNumber,
    };
  }
}
