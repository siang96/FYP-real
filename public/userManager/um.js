import { initSession, signOut } from "../sessionManager.js";
import {
  initFire,
  initFireDb,
  bigDiaglog,
  mediumDiaglog,
} from "../sharedFunction.js";

$.ajaxSetup({
  cache: false,
});
var callableFunc;

$(document).ready(function () {
  var initconfig = initFire();
  callableFunc = initconfig.functions("asia-southeast2");
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
  getUser();
}

function getUser() {
  var fireDb = initFireDb();
  var userData = [];
  fireDb
    .collection("user")
    .get()
    .then((dataSanpShot) => {
      dataSanpShot.forEach((docs) => {
        var docDetail = docs.data();
        var docId = docs.id;
        var docObj = [
          docId,
          docDetail.email,
          docDetail.name,
          docDetail.contactNum,
          docDetail.usrType,
        ];
        userData.push(docObj);
      });
      loadTable(userData);
    })
    .catch((error) => {
      console.error("error get user doc" + error);
    });
}

function loadTable(usrDataGet) {
  var dataTableOption = {
    paging: false,
    info: false,
    select: "single",
    data: usrDataGet,
  };
  var theTable = $("#dataTable").DataTable(dataTableOption);
  var numRows = theTable.rows().count();
  var usrData = {};
  var numChange = 0;
  var fireDb = initFireDb();
  var detacher = fireDb.collection("user").onSnapshot((snapshot) => {
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
      usrData.userId = tableData[0];
      usrData.email = tableData[1];
      usrData.userName = tableData[2];
      usrData.contactNum = tableData[3];
      usrData.usrType = tableData[4];
      $("#editBut").prop("disabled", false);
      $("#rmBut").prop("disabled", false);
    })
    .on("deselect", function (e, dt, type, indexes) {
      $("#editBut").prop("disabled", true);
      $("#rmBut").prop("disabled", true);
    });
  $("#newBut").click(function (e) {
    e.preventDefault();
    loadSetUsrForm("new", detacher,usrData);
  });
  $("#editBut").click(function (e) {
    e.preventDefault();
    loadSetUsrForm("edit", detacher, usrData);
  });
  $("#rmBut").click(function (e) {
    e.preventDefault();
    rmUsr(detacher, usrData);
  });
}

function newUsr(dataGot) {
  var updateStat = callableFunc.httpsCallable("newUser");
  updateStat(dataGot).then((resp) => {
    if (resp.data.stats == "success") {
      var fireDB = initFireDb();
      fireDB
        .collection("user")
        .doc(resp.data.userId)
        .set({
          email: dataGot.email,
          name: dataGot.userName,
          contactNum: dataGot.contactNum,
          usrType: dataGot.usrType,
        })
        .then(() => {
          $("#messageContent").append(
            "<br>User record created! <br> Please Wait for reload"
          );
          setTimeout(() => {
            location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error("error occur: " + error);
        });
    }
  });
}

function updateUsr(usrDataGot) {
  var updateStat = callableFunc.httpsCallable("updateUser");
  updateStat(usrDataGot).then((resp) => {
    if (resp.data.stats == "success") {
      var fireDB = initFireDb();
      fireDB
        .collection("user")
        .doc(usrDataGot.userId)
        .update({
          email: usrDataGot.email,
          name: usrDataGot.userName,
          contactNum: usrDataGot.contactNum,
          usrType: usrDataGot.usrType,
        })
        .then(() => {
          $("#messageContent").append(
            "<br>User record updated! <br> Please Wait for reload"
          );
          setTimeout(() => {
            location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error("error occur: " + error);
        });
    }
  });
}

function rmUsr(detacher, usrDataGot) {
  $("#messageTitle").html("Remove user");
  mediumDiaglog();
  $("#messageDialogCloseBut").show();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").load(
    "../assets/html/confirm.html",
    function (response, status, xhr) {
      if (status == "success") {
        $("#noButton").click(function (e) {
          e.preventDefault();
          $("#messageDialog").modal("hide");
        });
        $("#yesButton").click(function (e) {
          e.preventDefault();
          detacher();
          $("#messageDialogCloseBut").hide();
          $("#messageContent").html("Deleting");
          var uid = usrDataGot.userId;
          var fireDB = initFireDb();
          var removeStat = callableFunc.httpsCallable("removeUser");
          removeStat(uid).then((resp) => {
            if (resp.data.stats == "success") {
              fireDB
                .collection("user")
                .doc(uid)
                .delete()
                .then(() => {
                  $("#messageContent").append(
                    "<br>User record removed! <br> Please Wait for reload"
                  );
                  setTimeout(() => {
                    location.reload();
                  }, 2000);
                })
                .catch((error) => {
                  console.error("error occur: " + error);
                });
            }
          });
        });
      }
    }
  );
}

function loadSetUsrForm(caller, detacher, usrDataGot) {
  bigDiaglog();
  $("#messageDialogCloseBut").show();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").load(
    "../assets/html/userInfo.html",
    function (response, status, xhr) {
      if (status == "success") {
        $("#usrPw").change(function () {
          validPw();
        });
        $("#usrConfirmPw").keyup(function () {
          validPw();
        });
        if (caller == "new") {
          $("#messageTitle").html("New user");
          $("#usrPw").prop("required", true);
          $("#usrConfirmPw").prop("required", true);
          //submit call api detacher
        }
        if (caller == "edit") {
          $("#messageTitle").html("Edit user");
          setVal(usrDataGot);
        }
        $("#userForm").submit(function (e) {
          $("#userForm :input").prop("disabled", true);
          $("#submitButton").prop("disabled", true);
          e.preventDefault();
          usrDataGot.email = $("#userContactMail").val();
          usrDataGot.userName = $("#userName").val();
          usrDataGot.contactNum = $("#userContactNum").val();
          usrDataGot.usrType = $("#userType").val();
          usrDataGot.password = $("#usrPw").val();
          detacher();
          if (caller == "edit") {
            updateUsr(usrDataGot);
          }
          if(caller="new"){
              newUsr(usrDataGot);
          }
        });
      }
    }
  );
}

function validPw() {
  var password = document.getElementById("usrPw");
  var confirm_password = document.getElementById("usrConfirmPw");
  if (password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity("");
  }
}

function setVal(dataGot) {
  $("#userName").val(dataGot.userName);
  $("#userContactNum").val(dataGot.contactNum);
  $("#userContactMail").val(dataGot.email);
  $("#userType").val(dataGot.usrType);
}
