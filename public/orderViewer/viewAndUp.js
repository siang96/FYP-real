import { initFire, initFireDb } from "../sharedFunction.js";
import { getUid, initSession, signOut } from "../sessionManager.js";

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

function viewOrder() {
  //load from(id,functype)
}

function loadOrders() {
  var fireDb = initFireDb();
  var uid = getUid();
  var obtainedData = [];

  fireDb
    .collection("order")
    .where("personalDetail.userId", "==", uid)
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
      //add listner if select enable/disable button
      $("#viewBut").prop("disabled", false);
      $("#editBut").prop("disabled", false);
      $("#payBut").prop("disabled", false);
      $("#rmBut").prop("disabled", false);
    })
    .on("deselect", function (e, dt, type, indexes) {
      $("#viewBut").prop("disabled", true);
      $("#editBut").prop("disabled", true);
      $("#payBut").prop("disabled", true);
      $("#rmBut").prop("disabled", true);
    });
  //bind event
}

function tableListner(refTable) {
  var numRows = refTable.rows().count();
  var numChange = 0;
  var fireDb = initFireDb();
  var uid = getUid();
  fireDb
    .collection("order")
    .where("personalDetail.userId", "==", uid)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        numChange++;
        if (numChange > numRows) {
          location.reload();
        }
      });
    });
}
