import { initSession } from "../sessionManager.js";
import { initFire } from "../sharedFunction.js";
import { customAlphabet } from "../assets/frameworks/nanoid.js";
$.ajaxSetup ({
  // Disable caching of AJAX responses
  cache: false
});
const charGen =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const orderid = customAlphabet(charGen, 10);
//generates id orderid();
$(document).ready(function () {
  initFire();
  initSession();
  main();
});

function main() {
  $("#submitButton").hide();
  $("#formOption").on("change", function () {
    var selectedForm = this.value;
    $("#submitButton").show();
    $("#personalInfoArea").load("../assets/html/personalInfo.html");
    if (selectedForm.match(/Flyers/gi)) {
      $("#orderAddInfoArea").load("../assets/html/flyer.html");
    }
    if (selectedForm.match(/Hardcover/gi)) {
      $("#orderAddInfoArea").load("../assets/html/hardcover.html");
    }
    if (selectedForm.match(/businessCard/gi)) {
      $("#orderAddInfoArea").load("../assets/html/businessCard.html");
    }
    if (selectedForm.match(/banner/gi)) {
      $("#orderAddInfoArea").load("../assets/html/bunting.html");
    }
  });
}
