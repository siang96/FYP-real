import { redirector } from "../sessionManager.js";
import { hideDialogCloseBut, initFire, initFireDb } from "../sharedFunction.js";
$(document).ready(function () {
  initFire();
  //check if usr logged in
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
  firebase
    .auth()
    .createUserWithEmailAndPassword(mail, pw)
    .then((regUserCredential) => {
      initalUsr(regUserCredential.user);
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      $("#messageDialog").modal();
      $("#messageContent").html("Register failed!");
      console.error(
        "error occured ! \ncode: " +
          errorCode +
          "\nmessage: " +
          errorMessage +
          "\nfull error: \n" +
          error
      );
    });
}

function initalUsr(user) {
  var nameAdd, contactAdd,fireDB;
  fireDB=initFireDb();
  nameAdd = $("#usrName").val();
  contactAdd = $("#usrContactNum").val();
  var newUsrData = {
    usrType: "cust",
    name: nameAdd,
    contactNum: contactAdd,
  };
  fireDB
    .collection("user")
    .doc(user.uid)
    .set(newUsrData)
    .then(() => {
      hideDialogCloseBut();
      $("#messageDialog").modal({ backdrop: "static", keyboard: false });
      $("#messageContent").html("Register success <br> Please Wait for Login");
      //redirect here
      redirector();
    })
    .catch((error) => {
      $("#messageDialog").modal();
      $("#messageContent").html("Register failed!");
      console.error("error occured ! \nfull error: \n" + error);
    });
}
