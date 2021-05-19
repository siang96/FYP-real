import { getProfile, getUid, initSession } from "../sessionManager.js";
import { initFire, initFireDb } from "../sharedFunction.js";
import { customAlphabet } from "../assets/frameworks/nanoid.js";

$.ajaxSetup({
  cache: false,
});

const charGen =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const orderIdRaw = customAlphabet(charGen, 10);
const orderId = orderIdRaw();

$(document).ready(function () {
  initFire();
  initSession();
  main();
});

function main() {
  $("#progressBarArea").hide();
  $("#submitButton").hide();
  $("#formOption").on("change", function () {
    $("#messageDialog").modal({ backdrop: "static", keyboard: false });
    $("#messageContent").html("Loading");
    var selectedForm = this.value;
    $("#submitButton").show();
    $("#personalInfoArea").load(
      "../assets/html/personalInfo.html",
      function (response, status, xhr) {
        if (status == "success") {
          revertQtyText();
          fillPersonalInfo();
        }
      }
    );
    if (selectedForm.match(/Flyers/gi)) {
      $("#orderAddInfoArea").load(
        "../assets/html/flyer.html",
        function (response, status, xhr) {
          if (status == "success") {
            bindDeisgnService();
            $("#orderFile").prop("required", true);
          }
        }
      );
    }
    if (selectedForm.match(/Hardcover/gi)) {
      $("#orderAddInfoArea").load(
        "../assets/html/hardcover.html",
        function (response, status, xhr) {
          if (status == "success") {
            bindHardEvent();
            $("#orderFile").prop("required", true);
          }
        }
      );
    }
    if (selectedForm.match(/businessCard/gi)) {
      $("#orderAddInfoArea").load(
        "../assets/html/businessCard.html",
        function (response, status, xhr) {
          if (status == "success") {
            bindBusinessCard();
            bindDeisgnService();
            $("#orderFile").prop("required", true);
          }
        }
      );
    }
    if (selectedForm.match(/banner/gi)) {
      $("#orderAddInfoArea").load(
        "../assets/html/bunting.html",
        function (response, status, xhr) {
          if (status == "success") {
            bindDeisgnService();
            $("#orderFile").prop("required", true);
          }
        }
      );
    }
  });
  $("#order-form").submit(function (event) {
    event.preventDefault();
    var fireDB = initFireDb();
    var uid = getUid();
    var orderDate = new Date();
    var personalInfoData = $("#personalInfoArea :input").serializeArray();
    var orderInfoData = $("#orderAddInfoArea :input").serializeArray();
    var jsonData = {};
    var orderDetail = {};
    var personalDetail = {};

    var addData = {
      paymentId: "",
      orderDate: orderDate,
      orderEstPrice: "",
      orderStatus: "",
      paymentstat: "",
      deisgnServiceStatus: "",
      problem: "",
    };

    orderDetail["formOption"] = $("#formOption").val();
    personalDetail["userId"] = uid;

    orderInfoData.forEach((dataField) => {
      orderDetail[dataField.name] = dataField.value;
    });

    personalInfoData.forEach((dataField) => {
      personalDetail[dataField.name] = dataField.value;
    });

    if (orderDetail.orderDesignService != "on") {
      var orderFile = document.getElementById("orderFile").files[0];
      var refFileString = orderId + "/" + orderFile.name;
      addData["fileId"] = refFileString;
      delete addData.deisgnServiceStatus;
    }

    jsonData.orderDetail = orderDetail;
    jsonData.personalDetail = personalDetail;
    jsonData.statusDetail = addData;

    fireDB
      .collection("order")
      .doc(orderId)
      .set(jsonData)
      .then(function () {
        if (orderDetail.orderDesignService != "on") {
          uploadFile();
          $("#progressBarArea").show();
        } else {
          $("#messageContent").html("Success! Please Wait for refresh");
          $("#messageDialog").modal({ backdrop: "static", keyboard: false });
          setTimeout(() => {
            location.reload();
          }, 1000);
        }
      })
      .catch((error) => {
        $("#messageContent").html("Order placement failed!");
        $("#messageDialog").modal({ backdrop: "static", keyboard: false });
        console.error("error occured ! \nfull error: \n" + error);
      });

    $("#submitButton").prop("disabled", true);
    $("#order-form :input").prop("disabled", true);
  });
}

function bindHardEvent() {
  $("#hardMaterial").on("change", function () {
    var material = this.value;
    $("#hardColor").empty();
    $("#hardColor").append(
      `<option disabled selected value="">Choose color...</option>`
    );
    if (material == "buckram") {
      var optionsColor = { 550: "Blue", 557: "Green", 567: "Maroon" };
      var hashColor = ["#363490", "#0d693f", "#ac252c"];
    }
    if (material == "arcylic") {
      var optionsColor = { 2624: "Maroon", 2633: "Black", 2622: "Dark blue" };
      var hashColor = ["#261f63", "#ac252c", "#000000"];
    }
    var hashColorIndex = 0;
    $.each(optionsColor, function (key, text) {
      $("#hardColor").append(
        $("<option>", { value: key }).text(text).css({
          "background-color": hashColor[hashColorIndex],
          color: "white",
        })
      );
      hashColorIndex++;
    });
  });
}

function bindDeisgnService() {
  $("#orderDesignService").on("change", function (event) {
    if (event.target.checked) {
      $("#orderFile").prop("disabled", true);
      $("#orderFile").prop("required", false);
    } else {
      $("#orderFile").prop("disabled", false);
      $("#orderFile").prop("required", true);
    }
  });
}

function uploadFile() {
  var theFile = document.getElementById("orderFile").files[0];
  var refString = orderId + "/" + theFile.name;
  console.log(refString);
  var storeRef = firebase.storage().ref(refString);
  var upTask = storeRef.put(theFile);
  upTask.on(
    "state_changed",
    function progress(snapshot) {
      var percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      $("#theProgressBar")
        .attr("aria-valuenow", percent)
        .css("width", percent + "%");
    },
    function error(err) {
      console.error("upload error! " + err);
    },
    function complete() {
      $("#progressMessage").html("Complete! Please Wait for refresh");
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  );
}

function bindBusinessCard() {
  $("label[for='orderQuantity']").append(" (box) 100 pieces/box");
}

function revertQtyText() {
  $("label[for='orderQuantity']").text("Quantity");
}

async function fillPersonalInfo() {
  var uid = getUid();
  var userProfile, userProfileSys;
  userProfile = await getProfile(uid);
  userProfileSys = firebase.auth().currentUser;
  setTimeout(() => {
    $("#messageDialog").modal("hide");
  }, 1000);
  $("#OrderName").val(userProfile.name);
  $("#orderContactMail").val(userProfileSys.email);
  $("#orderContactNum").val(userProfile.contactNum);
}
