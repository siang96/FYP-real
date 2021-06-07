import {
  hideDialogCloseBut,
  initFire,
  initFireDb,
  loadForm,
  mediumDiaglog,
} from "../sharedFunction.js";
import { getProfile, getUid, initSession, signOut } from "../sessionManager.js";
$.ajaxSetup({
  cache: false,
});

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
    .where("personalDetail.userId", "==", uid)
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

async function loadTable(recieveData) {
  
  var dataTableOption = {
    paging: false,
    info: false,
    select: "single",
    data: recieveData,
  };
  var theTable = $("#dataTable").DataTable(dataTableOption);
  var orderId;
  var numRows = theTable.rows().count();
  var numChange = 0;
  var fireDb = initFireDb();
  var uid = getUid();
  var userProfile=await getProfile(uid);
  var detacher = fireDb
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
  theTable
    .on("select", function (e, dt, type, indexes) {
      var tableData = theTable.row(indexes).data();
      var estPrice = tableData[2];
      var orderStats = tableData[1];
      orderId = tableData[0];

      if (estPrice != "") {
        $("#payBut").prop("disabled", false);
      } else {
        $("#payBut").prop("disabled", true);
      }

      if (
        orderStats == "Payment confirmed" ||
        orderStats == "Producing order" ||
        orderStats == "Order ready to pickup" ||
        orderStats == "Order Complete" ||
        orderStats == "Order cancelation requested"
      ) {
        $("#rmBut").prop("disabled", true);
        $("#editBut").prop("disabled", true);
      } else {
        $("#rmBut").prop("disabled", false);
        $("#editBut").prop("disabled", false);
      }

      $("#viewBut").prop("disabled", false);
    })
    .on("deselect", function (e, dt, type, indexes) {
      $("#viewBut").prop("disabled", true);
      $("#editBut").prop("disabled", true);
      $("#payBut").prop("disabled", true);
      $("#rmBut").prop("disabled", true);
    });
  $("#viewBut").click(function (event) {
    event.preventDefault();
    loadForm(orderId, "view");
  });
  $("#editBut").click(function (e) {
    e.preventDefault();
    loadForm(orderId, "updateUser", detacher);
  });
  $("#rmBut").click(function (e) {
    e.preventDefault();
    cancelOrder(orderId, detacher,userProfile.name);
  });
}

function cancelOrder(orderIdGet, detachGot,nameUpdate) {
  hideDialogCloseBut();
  $("#messageDialogCloseBut").show();
  mediumDiaglog();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageTitle").html("Cancel order");
  $("#messageContent").load(
    "../assets/html/confirm.html",
    function (response, status, xhr) {
      if (status == "success") {
        $("#noButton").click(function (e) {
          e.preventDefault();
          $("#messageDialog").modal("hide");
        });
        $("#yesButton").click(function (e) {
          detachGot();
          $("#messageDialogCloseBut").hide();
          $("#messageContent").html("Placing request");
          e.preventDefault();
          var fireDB = initFireDb();
          fireDB
            .collection("order")
            .doc(orderIdGet)
            .update({
              "statusDetail.orderStatus": "Order cancelation requested",
              "statusDetail.orderDateUpdate":
                firebase.firestore.FieldValue.serverTimestamp(),
                "statusDetail.lastUserUpdate":nameUpdate
            })
            .then(() => {
              $("#messageContent").append(
                "<br>Success!<br> Please Wait for reload"
              );
              setTimeout(() => {
                location.reload();
              }, 2000);
            })
            .catch((error) => {
              console.error("error occur: " + error);
            });
        });
      }
    }
  );
}
