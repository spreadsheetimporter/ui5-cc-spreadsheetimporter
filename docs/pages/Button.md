# Button

Currently in development is a UI5 button that can be used especially for freestyle applications.  
It would be used like this:

````xml
<mvc:View
   controllerName="sap.ui.demo.walkthrough.controller.HelloPanel"
   xmlns="sap.m"
   xmlns:mvc="sap.ui.core.mvc">
   <Panel
      headerText="{i18n>helloPanelTitle}"
      class="sapUiResponsiveMargin"
      width="auto" >
      <content>
        <excel:ExcelUpload text="test" tableId="container-sap.ui.demo.walkthrough---mainView--table"/>
        <Table id="table" items="{invoice>/Invoices}" >
        ...
      </content>
   </Panel>
</mvc:View>
````

More information and will come.

https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/packages/ui5-cc-excelUpload-Button

https://www.npmjs.com/package/ui5-cc-excelupload-button