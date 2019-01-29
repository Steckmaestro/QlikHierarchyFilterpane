var html = '';
var test = {
  name: 'Level1',
  depth: 1,
  children: [
    {
      name: 'A',
      depth: 2,
    },
    {
      name: 'B',
      depth: 2,
    },
    {
      name: 'C',
      depth: 2,
      children: [
        {
          name: '10',
          depth: 3,
        },
      ],
    },
  ],
};

var html = '';
function listHtml(object, depth) {
  if (object.depth == '1') {
    html += '<ul class="hierarchy-anchor">';
    html += '<li class="' + object.depth + '-1">' + object.name + '</li>';
    if (object.children !== undefined) {
      listHtml(object.children, object.depth + 1);
    }
    html += '</ul>';
  } else {
    if (object instanceof Array) {
      html += '<ul>';
      for (var i = 0; i < object.length; i++) {
        listHtml(object[i]);
      }
      html += '</ul>';
    } else if (object instanceof Object) {
      var objectKeys = Object.keys(object);
      for (var j = 0; j < objectKeys.length; j++) {
        if (objectKeys[j] === 'name') {
          html += '<li class="' + object.depth + '-' + i + '">' + object.name + '</li>';
        } else if (objectKeys[j] === 'children' && object[objectKeys[j]] instanceof Array) {
          listHtml(object[objectKeys[j]]);
        }
      }
    }
  }
}

console.log('Test');


$(document.createElement('DIV'));

// listHtml(test);
// console.log(html);
