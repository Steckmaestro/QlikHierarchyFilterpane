# QlikHierarchyFilterpane
An extension for Qlik sense to generate a hierarchy filterpane

Special thanks to @rvspt (https://github.com/rvspt/D3DynamicTreeLayout-QS)
His hierarchy extension for Qlik Sense was my starting point and I used some of his code to generate the node tree recursively.

Usage tips:

- Make sure to properly specify (case sensitive) column names
- Make sure ID/Level columns are valid int.
- Make sure root element has null-value as parentId

If you are unsure checkout my demo app :) 

Here you can see how it looks in action.
![Alt text](/demo-images/example-render.png?raw=true "Example of render")

Configuration is very similar to rvspt's hierarchy extension I did however add an auto expand level function.
![Alt text](/demo-images/configuration.png?raw=true "Example of render")

This is the demo hierarchy table i used to test my extension (also included in the demo app)
![Alt text](/demo-images/hierarchy-table.png?raw=true "Example of render")

Hope this is appreciated by someone!
