import { initFire, initFireDb,loadForm } from "../sharedFunction.js";
import { initSession } from "../sessionManager.js";

var refTable;

$(document).ready(function () {
  initFire();
  initSession();
  mainFunc();
});

function mainFunc() {
  var generateTimes = 0;
  var today = new Date().toISOString().split("T")[0];
  $("#maxDate").attr("max", today);
  $("#resultRow").hide();
  $("#dateForm").submit(function (e) {
    e.preventDefault();
    genereateRept(generateTimes);
    generateTimes++;
  });
}

function genereateRept(timegenerated) {
  $("#resultRow").show();
  var startDateInput = $("#minDate").val();
  var endDateInput = $("#maxDate").val();
  var startDate = new Date(startDateInput);
  var endDate = new Date(endDateInput);
  var generatedData = [];
  var fireDb = initFireDb();
  fireDb
    .collection("order")
    .where("statusDetail.orderDate", ">=", startDate)
    .where("statusDetail.orderDate", "<=", endDate)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var rawData = doc.data();
        var docId = doc.id;
        var dateUpdate = "";
        if (rawData.statusDetail.orderDateUpdate) {
          dateUpdate = rawData.statusDetail.orderDateUpdate
            .toDate()
            .toDateString();
        }
        var objCreated = [
          docId,
          rawData.statusDetail.orderStatus,
          rawData.statusDetail.orderEstPrice,
          rawData.statusDetail.paymentstat,
          rawData.statusDetail.deisgnServiceStatus,
          rawData.orderDetail.formOption,
          dateUpdate,
        ];
        generatedData.push(objCreated);
        //add counters
      });
      if (timegenerated == 0) {
        refTable = loadResult(generatedData);
      } else {
        loadNewData(generatedData);
      }
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

function loadResult(resultArray) {
  var dataTableOption = {
    paging: true,
    info: true,
    select: "single",
    data: resultArray,
    responsive: true,
  };
  var orderId;
  var theTable = $("#dataTable").DataTable(dataTableOption);
  theTable
    .on("select", function (e, dt, type, indexes) {
      var tableData = theTable.row(indexes).data();
      orderId = tableData[0];
      $("#viewBut").prop("disabled", false);
    })
    .on("deselect", function (e, dt, type, indexes) {
      $("#viewBut").prop("disabled", true);
    });
  $("#viewBut").click(function (event) {
    event.preventDefault();
    loadForm(orderId, "view");
  });
  return theTable;
}

function loadNewData(newData) {
  refTable.clear().draw();
  refTable.rows.add(newData); // Add new data
  refTable.columns.adjust().draw();
}