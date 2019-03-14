<<<<<<< HEAD
//create a new node object
function node(node_id, element_id, parent_id, name, measure, depth, qElemNumber) {
  return {
    node_id: node_id,
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
  //Attach rootNodes to tree
  var tree = [];

  //If we have nodes one level down we try to attach them to the parent;
  if (rootNodes.length > 0) {
    // console.log('Temp nodes: ', tempNodes);
    for (j = 0; j < rootNodes.length; j++) {
      var parent = rootNodes[j];
      // tree = getNestedChildren(cleanedLeafs, parent.parentId);
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
        parentlessNodes.push(nodes[n]);
      }
    }
    return parentlessNodes;
  }
  function nodeJsonReady(node) {
    if (node.childs.length > 0)
      return {
        name: node.name,
        nodeId: node.element_id,
        parentId: node.parent_id,
        children: node.childs,
        size: node.measure,
        depth: node.depth,
        qElemNumber: node.qElemNumber,
      };
    return {
      name: node.name,
      nodeId: node.element_id,
      parentId: node.parent_id,
      size: node.measure,
      depth: node.depth,
      qElemNumber: node.qElemNumber,
    };
  }
}
=======
//create a new node object
function node(node_id, element_id, parent_id, name, measure, depth, qElemNumber) {
  return {
    node_id: node_id,
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
function growTree(leafs, max_depth, min_depth) {
  var tree = [];
  var tree = sameLevelLeafs(leafs, max_depth);
  if (max_depth > min_depth) var temp2 = sameLevelLeafs(leafs, max_depth - 1);

  for (time_left_to_grow = max_depth; time_left_to_grow > min_depth; time_left_to_grow--) {
    for (i = 0; i < tree.length; i++)
      for (j = 0; j < temp2.length; j++)
        if (getElementId(temp2[j]) == getElementParentId(tree[i])) temp2[j].childs.push(nodeJsonReady(tree[i]));

    tree = temp2;
    temp2 = sameLevelLeafs(leafs, time_left_to_grow - 2);
  }

  tree = nodeJsonReady(tree[0]);

  return tree;
}

//returns an array will all the leafs that are at the same level as 'depth'
function sameLevelLeafs(leafs, depth) {
  var ground_leafs = [];
  for (i = 0; i < leafs.length; i++) {
    if (leafs[i].depth == depth) ground_leafs.push(leafs[i]);
  }
  return ground_leafs;
}

//returns the node's element id
function getElementId(node) {
  return node.element_id;
}

//returns the node parent's id
function getElementParentId(node) {
  return node.parent_id;
}

//returns a node with limited objects to JSON conversion
function nodeJsonReady(node) {
  if (node.childs.length > 0)
    return {
      name: node.name,
      nodeId: node.node_id,
      parentId: node.parent_id,
      children: node.childs,
      size: node.measure,
      depth: node.depth,
      qElemNumber: node.qElemNumber,
    };
  return {
    name: node.name,
    nodeId: node.node_id,
    parentId: node.parent_id,
    size: node.measure,
    depth: node.depth,
    qElemNumber: node.qElemNumber,
  };
}
>>>>>>> a14ea29a2bb3fae19a999a36bc72916e8a59b506
