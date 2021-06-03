import { initSession } from "../sessionManager.js";
import {
  hideDialogCloseBut,
  initFire,
  initFireDb,
  showDialogCloseBut,
} from "../sharedFunction.js";
$(document).ready(function () {
  initFire();
  initSession();
  mainFunc();
});

function mainFunc() {
  var email, password;
  $("#reg-form").submit(function (event) {
    email = $("#usrEmail").val();
    password = $("#usrPw").val();
    event.preventDefault();
    register(email, password);
  });
  $("#usrPw").change(function () {
    validPw();
  });
  $("#usrConfirmPw").keyup(function () {
    validPw();
  });
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

function register(mail, pw) {
  hideDialogCloseBut();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").html("Registering");
  firebase
    .auth()
    .createUserWithEmailAndPassword(mail, pw)
    .then((regUserCredential) => {
      initalUsr(regUserCredential.user);
    })
    .catch((error) => {
      showDialogCloseBut();
      $("#messageContent").html(
        "Register failed!<br>Error Message<br>" + error
      );
      console.error("auth reg error! \ncode: " + "full error: \n" + error);
    });
}

function initalUsr(user) {
  var nameAdd, contactAdd, fireDB;
  fireDB = initFireDb();
  nameAdd = $("#usrName").val();
  contactAdd = $("#usrContactNum").val();
  var newUsrData = {
    usrType: "cust",
    name: nameAdd,
    contactNum: contactAdd,
    email:user.email
  };
  fireDB
    .collection("user")
    .doc(user.uid)
    .set(newUsrData)
    .then(function () {
      $("#messageContent").html("Register success <br> Please Wait for Login");
    })
    .catch((error) => {
      console.error("error initi user ! \nfull error: \n" + error);
    });
}
