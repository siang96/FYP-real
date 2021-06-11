import {
  getProfile,
  getUid,
  initSession,
  redirector,
} from "../sessionManager.js";
import { initFire, initFireDb } from "../sharedFunction.js";

$(document).ready(function () {
  initFire();
  initSession();
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      main();
    }
  });
});

async function main() {
  let params = new URLSearchParams(document.location.search.substring(1));
  let oid = params.get("oid");
  let payStat = params.get("stats");
  var currUid = getUid();
  var currProfile = await getProfile(currUid);
  let statText;
  if (params != "") {
    if (payStat == "success") {
      statText = "Paid online success";
    }
    if (payStat == "failed") {
      statText = "Paid online failed";
    }
    $("#pageBody").append("Processing payments");
    var fireDb = initFireDb();
    fireDb
      .collection("order")
      .doc(oid)
      .update({
        "statusDetail.paymentstat": statText,
      })
      .then(() => {
        $("#pageBody").append(
          "<br>Payment " + payStat + "<br> Please Wait for reload"
        );
        setTimeout(() => {
          redirector(currProfile);
        }, 2000);
      })
      .catch((error) => {
        console.error("pay process error " + error);
      });
  } else {
    $("#pageBody").append("You're not suppose here");
    setTimeout(() => {
      redirector(currProfile);
    }, 2000);
  }
}
