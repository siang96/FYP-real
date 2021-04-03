function intitalDatatables() {
  var dataTableOption = {
    paging: false,
    ordering: false,
    info: false,
    select: "single",
  };
  var theTable = $("#dataTable").DataTable(dataTableOption);
}

function hideDialogCloseBut() {
  $("#messageDialogCloseBut").hide();
  $("#messageDialogFooter").hide();
}

export { intitalDatatables, hideDialogCloseBut };
