import { initSession, signOut } from "../sessionManager.js";
import {
  initFire,
  initFireDb,
  loadForm,
  hideDialogCloseBut,
  mediumDiaglog,
  getOrder,
} from "../sharedFunction.js";

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
  var obtainedData = [];

  fireDb
    .collection("order")
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
    info: false,
    select: "single",
    data: recieveData,
  };
  var theTable = $("#dataTable").DataTable(dataTableOption);
  var numRows = theTable.rows().count();
  var orderId;
  var numChange = 0;
  var fireDb = initFireDb();
  var detacher = fireDb.collection("order").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      numChange++;
      if (numChange > numRows) {
        location.reload();
      }
    });
  });
  theTable
    .on("select", function (e, dt, type, indexes) {
      var tableData = theTable.row(indexes).data();
      orderId = tableData[0];
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
    window.location.href = "../createOrder/";
  });
  $("#viewBut").click(function (event) {
    event.preventDefault();
    loadForm(orderId, "view");
  });
  $("#editBut").click(function (e) {
    e.preventDefault();
    loadForm(orderId, "updateStaff");
  });
  $("#rmBut").click(function (e) {
    e.preventDefault();
    removeOrder(orderId, detacher);
  });
  //bind event
}

function removeOrder(idGet, detacherGot) {
  hideDialogCloseBut();
  $("#messageDialogCloseBut").show();
  mediumDiaglog();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageTitle").html("Remove order");
  $("#messageContent").load(
    "../assets/html/confirm.html",
    function (response, status, xhr) {
      if (status == "success") {
        $("#noButton").click(function (e) {
          e.preventDefault();
          $("#messageDialog").modal("hide");
        });
        $("#yesButton").click(async function (e) {
          detacherGot();
          $("#messageDialogCloseBut").hide();
          $("#messageContent").html("Deleting");
          e.preventDefault();
          var fireDB = initFireDb();
          var orderData = await getOrder(idGet);
          if (orderData.statusDetail.fileId) {
            var removeFielRef = firebase
              .storage()
              .ref(orderData.statusDetail.fileId);
            removeFielRef
              .delete()
              .then(() => {
                $("#messageContent").append("<br>File removed!");
              })
              .catch((error) => {
                console.error("error occur: " + error);
              });
          }
          fireDB
            .collection("order")
            .doc(idGet)
            .delete()
            .then(() => {
              $("#messageContent").append(
                "<br>Record removed! <br> Please Wait for reload"
              );
              location.reload();
            })
            .catch((error) => {
              console.error("error occur: " + error);
            });
        });
      }
    }
  );
}
