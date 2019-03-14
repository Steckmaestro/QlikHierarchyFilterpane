# QlikHierarchyFilterpane
An extension for Qlik sense to generate a filterpane treeview based of a regular hierarchytable. Can recursively generate any tree.

Special thanks to @rvspt (https://github.com/rvspt/D3DynamicTreeLayout-QS)
His hierarchy extension for Qlik Sense was my starting point and I used some of his code to generate the nodetree recursively and to query the Qlik Sense Engine API.

If you are unsure on how to configure checkout my demo app :) 

Here you can see how it looks in action.
![Alt text](/demo-images/example-render.png?raw=true "Example of render")

Closeup on how a rendered filterpane looks

![Alt text](/demo-images/example-hierarchy.png?raw=true "Closeup of hierarchy")

Configuration is very similar to rvspt's hierarchy extension I did however add an auto expand level function. 
2019-03-14: Added additional support to ignore selections on other dimensions.
![Alt text](/demo-images/configuration.png?raw=true "Configuration")

This is the demo hierarchy table i used to test my extension (also included in the demo app)
![Alt text](/demo-images/hierarchy-table.png?raw=true "Example of hierarchy table")

2019-03-14:
Added new select highlight
![Alt text](/demo-images/high-light.png?raw=true "Example of hierarchy table")

Tested in Chrome, Firefox, IE11.

Check in case it's not working properly:
- Make sure to properly specify (case sensitive) column names
- Make sure ID/Level columns are valid int.
- Make sure root element has null-value as parentId
2019-03-14: Not sure if this applies anymore.

Known issues/improvements:
- Sorting (asc/desc) not working properly as of today
- Anything that causes rerender resets the tree to the original state (e.g. collapses certain branches)
- As of now we don't support more than 1000 nodes in your hierarchy.

Hope this is appreciated by someone!

Updates:
2019-03-14:
  - Rewrote some code that generates the tree, so selections work more correct. 
  - Added selection highlighting and new configuration options to ignore selections on other columns.
