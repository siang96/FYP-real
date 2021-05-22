import { initSession, signOut, getUid } from "../sessionManager.js";
import { initFire, initFireDb } from "../sharedFunction.js";

$(document).ready(function () {
  initFire();
  initSession();
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      main();
    }
  });
});

function main() {
  $("#logoutButton").click(function (e) {
    e.preventDefault();
    signOut();
  });
  loadOrders();
}

function loadOrders() {
  var fireDb = initFireDb();
  var uid = getUid();
  var obtainedData = [];

  fireDb
    .collection("order")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var rawData = doc.data();
        var docId = doc.id;
        var objCreated = [
          docId,
          rawData.statusDetail.orderStatus,
          rawData.statusDetail.orderEstPrice,
          rawData.statusDetail.paymentstat,
        ];
        obtainedData.push(objCreated);
      });
      loadTable(obtainedData);
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

function loadTable(recieveData) {
  var dataTableOption = {
    paging: false,
    ordering: false,
    info: false,
    select: "single",
    data: recieveData,
  };
  var theTable = $("#dataTable").DataTable(dataTableOption);
  tableListner(theTable);
  theTable
    .on("select", function (e, dt, type, indexes) {
      $("#viewBut").prop("disabled", false);
      $("#editBut").prop("disabled", false);
      $("#rmBut").prop("disabled", false);
    })
    .on("deselect", function (e, dt, type, indexes) {
      $("#viewBut").prop("disabled", true);
      $("#editBut").prop("disabled", true);
      $("#rmBut").prop("disabled", true);
    });
    $("#newBut").click(function (e) { 
        e.preventDefault();
        window.location.href="../createOrder/";
    });
  //bind event
}

function tableListner(refTable) {
  var numRows = refTable.rows().count();
  var numChange = 0;
  var fireDb = initFireDb();
  var uid = getUid();
  fireDb.collection("order").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      numChange++;
      if (numChange > numRows) {
        location.reload();
      }
    });
  });
}
