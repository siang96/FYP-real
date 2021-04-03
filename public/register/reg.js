import { hideDialogCloseBut } from "../sharedFunction.js";
$(document).ready(mainFunc);

function mainFunc() {
  var uName, uContactNum, uEmail, pw, cPw;
  uName = $("#usrName");
  uContactNum = $("#usrContactNum");
  uEmail = $("#usrEmail");
  pw = $("#usrPw");
  cpw= $("#usrConfirmPw");
  $("#reg-form").submit(function (event) {
    event.preventDefault();
  });
}

function validPw() {}
