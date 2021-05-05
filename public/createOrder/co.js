import { initSession } from "../sessionManager.js";
import { initFire } from "../sharedFunction.js";
import { customAlphabet } from "../assets/frameworks/nanoid.js";

const charGen =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(charGen, 10);
const orderid=nanoid();
$(document).ready(function () {
  initFire();
  initSession();
  //load form auto input

  main();
});

function main() {
  $("#formOption").on("change", function () {
    var selectedForm = this.value;
    if (selectedForm.match(/Flyers/gi)) {
      $("#formArea").load("../assets/html/flyer.html");
    }
    if (selectedForm.match(/Hardcover/gi)) {
      $("#formArea").load("../assets/html/hardcover.html");
    }
    if (selectedForm.match(/Stamp/gi)) {
      $("#formArea").load("../assets/html/nameTag.html");
    }
  });
  
}
