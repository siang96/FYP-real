import {
  bindCommonEvents,
  initFire,
  initFireDb,
  uploadFile,
  revertQtyText,
  fillPersonalInfo,
} from "../sharedFunction.js";
import { customAlphabet } from "../assets/frameworks/nanoid.js";
import { getUid, initSession } from "../sessionManager.js";

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
    bindCommonEvents(selectedForm);
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
      orderDate: orderDate,
      orderEstPrice: "",
      orderStatus: "Order placed",
      paymentstat: "Not paid",
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
      addData.deisgnServiceStatus = "Not Requested";
    }

    if (orderDetail.orderDesignService == "on") {
      addData.deisgnServiceStatus = "Service requested";
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
          uploadFile(orderId);
        } else {
          $("#messageContent").html(
            "Success!<br>Your order id " +
              orderId +
              "<br>Please Wait for refresh"
          );
          $("#messageDialog").modal({ backdrop: "static", keyboard: false });
          setTimeout(() => {
            location.reload();
          }, 5000);
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
