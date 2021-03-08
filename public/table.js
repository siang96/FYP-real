$(document).ready( function () {
  var dataTableOption = {
    "paging": false,
    "ordering": false,
    "info": false,
    select: 'single'
  };
  var theTable = $("#myTable").DataTable(dataTableOption);
} );
