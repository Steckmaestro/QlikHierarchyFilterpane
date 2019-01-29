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

/*
TODO: EDIT!!!
*/

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

// Tree traversal code
