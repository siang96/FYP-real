import { hideDialogCloseBut } from "./sharedFunction.js";
$(document).ready(mainFunc);

function mainFunc() {
  var uEmail, uPw;
  $("#login-form").submit(function (event) {
    event.preventDefault();
    uEmail = $("#uEmail").val();
    uPw = $("#uPw").val();
    firebase
      .auth()
      .signInWithEmailAndPassword(uEmail, uPw)
      .then((user) => {
        hideDialogCloseBut();
        $("#messageDialog").modal({ backdrop: "static", keyboard: false });
        $("#messageContent").html(
          "Login success <br> Please Wait for redirect"
        );
      })
      .catch((error) => {
        $("#messageDialog").modal();
        $("#messageContent").text("Login failed");
        console.error(
          "login error code " + error.code + " \nmessage:" + error.message
        );
      });
  });
}
