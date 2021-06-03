import { getUid, getProfile } from "./sessionManager.js";

function hideDialogCloseBut() {
  $("#messageDialogCloseBut").hide();
  $("#messageDialogFooter").hide();
}

function showDialogCloseBut() {
  $("#messageDialogCloseBut").show();
  $("#messageDialogFooter").show();
}

function initFire() {
  var firebaseConfig = {
    apiKey: "AIzaSyClxeFYJNbZFSnvrigNumSDqIDNnAbI-xI",
    authDomain: "psmis-webapp.firebaseapp.com",
    databaseURL:
      "https://psmis-webapp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "psmis-webapp",
    storageBucket: "psmis-webapp.appspot.com",
    messagingSenderId: "444178708470",
    appId: "1:444178708470:web:777d2c0bf38e6b84a1b9d7",
  };
  firebase.initializeApp(firebaseConfig);
}

function initFireDb() {
  return firebase.firestore();
}

function bigDiaglog() {
  if (!$("#messageDialog").children().hasClass("modal-lg")) {
    $("#messageDialog").children().addClass("modal-lg");
  }
}

function mediumDiaglog() {
  if ($("#messageDialog").children().hasClass("modal-lg")) {
    $("#messageDialog").children().removeClass("modal-lg");
  }
}

async function loadForm(orderIdObtained, buttonType) {
  var order = await getOrder(orderIdObtained);
  if (order.statusDetail.deisgnServiceStatus == "Not Requested") {
    var fileRef = order.statusDetail.fileId;
  }

  bigDiaglog();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").load(
    "../assets/html/orderForm.html",
    function (response, status, xhr) {
      if (status == "success") {
        $("#orderId").val(orderIdObtained);
        $("#formOption").val(order.orderDetail.formOption);
        loadPInfo(order.personalDetail, buttonType);
        loadOAddInfo(order.orderDetail, buttonType);
        $("#downButArea").hide();
        $("#progressBarArea").hide();
        if (buttonType == "view") {
          loadOrderStats(order.statusDetail, buttonType);
          showDialogCloseBut();
          $("#messageTitle").html("View Order");
          $("#formOption").prop("disabled", true);
          $("#submitButton").hide();
          if (order.statusDetail.deisgnServiceStatus == "Not Requested") {
            $("#downButArea").show();
            $("#downButArea").click(function (event) {
              event.preventDefault();
              downloadFile(fileRef);
            });
          }
        }
        if (buttonType.match(/update/gi)) {
          $("#messageTitle").html("Update Order");
          $("#messageDialogFooter").hide();
          $("#messageDialogCloseBut").show();
          $("#formOption").prop("disabled", true);
        }
        if (buttonType == "updateStaff") {
          console.log("update staff called");
          loadOrderStats(order.statusDetail, buttonType);
          //bind o stats events
          //bind sumnit
          //based on users
        }
        if (buttonType == "updateUser") {
          updateUser(order);
        }
      }
    }
  );

  //if (functype) is edit, show orderfile area bind show submit but
  //=> delete replace file on submit
}

function bindCommonEvents(selectedFormGet) {
  $("#submitButton").show();
  if (selectedFormGet.match(/Flyers/gi)) {
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
  if (selectedFormGet.match(/Hardcover/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/hardcover.html",
      function (response, status, xhr) {
        if (status == "success") {
          $("#hardMaterial").on("change", function () {
            var material = this.value;
            bindHardEvent(material);
          });
          $("#orderFile").prop("required", true);
        }
      }
    );
  }
  if (selectedFormGet.match(/Business Card/gi)) {
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
  if (selectedFormGet.match(/Banner/gi)) {
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
}

function bindStatsEvent() {
  //stats event
}

function bindUpdatesEvent(optionGet) {
  if (optionGet.match(/flyer/gi)) {
    bindDeisgnService();
    $("#orderFile").prop("required", true);
  }
  if (optionGet.match(/hard/gi)) {
    $("#hardMaterial").on("change", function () {
      var material = this.value;
      bindHardEvent(material);
    });
    $("#orderFile").prop("required", true);
  }
  if (optionGet.match(/bCard/gi)) {
    bindBusinessCard();
    bindDeisgnService();
    $("#orderFile").prop("required", true);
  }
  if (optionGet.match(/bunting/gi)) {
    bindDeisgnService();
    $("#orderFile").prop("required", true);
  }
}

function updateStaff(params) {}

function updateUser(oldOrder) {
  $("#orderForm").submit(function (e) {
    e.preventDefault();
    var theFile = document.getElementById("orderFile").files[0];
    var oldFileRef = oldOrder.statusDetail.fileId;
    var orderId = $("#orderId").val();
    var formOption = $("#formOption").val();
    var orderDateUp = new Date();
    var personalInfoData = $("#personalInfoArea :input").serializeArray();
    var orderInfoData = $("#orderAddInfoArea :input").serializeArray();
    var jsonDataUpdate = {};
    var orderDetail = {};
    var personalDetail = {};

    var addData = {
      orderDateUpdate: orderDateUp,
      orderEstPrice: "",
      orderStatus: "Order update placed",
      paymentstat: "Not paid",
      deisgnServiceStatus: "",
      problem: "",
    };

    orderDetail["formOption"] = $("#formOption").val();

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

    jsonDataUpdate.orderDetail = orderDetail;
    jsonDataUpdate.personalDetail = personalDetail;
    jsonDataUpdate.statusDetail = addData;

    console.log(jsonDataUpdate);
    if (theFile) {
      //delete file
      console.log("delete file");
    }
  });
}

function downloadFile(fileRefProvided) {
  var fileName = fileRefProvided.split("/");
  var storeRef = firebase.storage().ref(fileRefProvided);
  storeRef
    .getDownloadURL()
    .then((url) => {
      var link = document.createElement("a");
      link.download = fileName[1];
      link.href = url;
      link.target = "_blank";
      link.click();
    })
    .catch((error) => {
      console.error("unable to download " + error);
    });
}

function loadPInfo(pDetailRecieve, buttonCaller) {
  $("#personalInfoArea").load(
    "../assets/html/personalInfo.html",
    function (response, status, xhr) {
      if (status == "success") {
        setDataEvent(pDetailRecieve, "pInfo", buttonCaller);
        if (buttonCaller == "view") {
          $("#personalInfoArea :input").prop("disabled", true);
        }
      }
    }
  );
}

function loadOAddInfo(detailRecieve, callerTypeGet) {
  var selectedForm = detailRecieve.formOption;
  if (selectedForm.match(/Flyers/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/flyer.html",
      function (response, status, xhr) {
        if (status == "success") {
          setDataEvent(detailRecieve, "flyer", callerTypeGet);
          fieldDisabler(callerTypeGet);
        }
      }
    );
  }
  if (selectedForm.match(/Hardcover/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/hardcover.html",
      function (response, status, xhr) {
        if (status == "success") {
          setDataEvent(detailRecieve, "hard", callerTypeGet);
          fieldDisabler(callerTypeGet);
        }
      }
    );
  }
  if (selectedForm.match(/business Card/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/businessCard.html",
      function (response, status, xhr) {
        if (status == "success") {
          setDataEvent(detailRecieve, "bcard", callerTypeGet);
          fieldDisabler(callerTypeGet);
        }
      }
    );
  }
  if (selectedForm.match(/banner/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/bunting.html",
      function (response, status, xhr) {
        if (status == "success") {
          setDataEvent(detailRecieve, "bunting", callerTypeGet);
          fieldDisabler(callerTypeGet);
        }
      }
    );
  }
}

function fieldDisabler(caller) {
  if (caller == "view") {
    $("#orderFileArea").hide();
    $("#orderAddInfoArea :input").prop("disabled", true);
  }
}

function loadOrderStats(data, callRecieved) {
  $("#orderStatsArea").load(
    "../assets/html/orderStats.html",
    function (response, status, xhr) {
      if (status == "success") {
        setDataEvent(data, "oStats", callRecieved);
        if (callRecieved == "view") {
          $("#orderStatsArea :input").prop("disabled", true);
        }
      }
    }
  );
}

function setDataEvent(data, formType, caller) {
  if (formType == "pInfo") {
    $("#OrderName").val(data.OrderName);
    $("#orderContactNum").val(data.orderContactNum);
    $("#orderContactMail").val(data.orderContactMail);
    $("#orderQuantity").val(data.orderQuantity);
  }

  if (formType == "flyer") {
    $("#orderPaperType").val(data.orderPaperType);
    $("#orderPaperSize").val(data.orderPaperSize);
  }
  if (formType == "hard") {
    bindHardEvent(data.hardMaterial);
    $("#hardMaterial").val(data.hardMaterial);
    $("#hardColor").val(data.hardColor);
  }
  if (formType == "bunting") {
    $("#orderFinishType").val(data.orderFinishType);
    $("#orderSizeHeight").val(data.orderSizeHeight);
    $("#orderSizeWidth").val(data.orderSizeWidth);
  }
  if (formType == "bunting" || formType == "bcard" || formType == "flyer") {
    if (data.orderDesignService == "on") {
      $("#orderDesignService").prop("checked", true);
    }
    if (data.orderDoubleSide == "on") {
      $("#orderDoubleSide").prop("checked", true);
    }
  }
  if (formType == "oStats") {
    $("#orderStatus").val(data.orderStatus);
    $("#deisgnServiceStatus").val(data.deisgnServiceStatus);
    $("#orderDate").val(toIsoString(data.orderDate.toDate()));
    if (data.orderDateUpdate) {
      $("#orderDateUpdate").val(toIsoString(data.orderDateUpdate.toDate()));
    }
    $("#orderEstPrice").val(data.orderEstPrice);
    $("#paymentstat").val(data.paymentstat);
    if (data.problem == "") {
      $("#problem").val("No problems");
    } else {
      $("#problem").val(data.problem);
    }
  }
  if (caller == "view") {
    if (formType == "flyer") {
      $("label[for='paperType']").html("Selected paper type");
      $("label[for='paperSize']").html("Selected paper size");
      $("#orderDesignServiceText").html("Design Service");
    }
    if (formType == "hard") {
      $("label[for='hardMaterial']").html("Choosen Material");
      $("label[for='hardColor']").html("Choosen color");
      $("#fileAddInfo").hide();
    }
    if (formType == "bcard") {
      $("label[for='orderQuantity']").append(" (boxes) 100 pieces/box");
      $("#orderDesignServiceText").html("Design Service");
    }
    if (formType == "bunting") {
      $("#orderDesignServiceText").html("Design Service");
      $("label[for='orderFinishType']").append("Finish choosen");
      $("label[for='orderSizeHeight']").append("Height (Foot)");
      $("label[for='orderSizeWidth']").append("Width (Foot)");
    }
  }
  if (caller.match(/update/gi)) {
    bindUpdatesEvent(formType);
    if (formType == "bunting" || formType == "bcard" || formType == "flyer") {
      if (data.orderDesignService == "on") {
        $("#orderFile").prop("disabled", true);
        $("#orderFile").prop("required", false);
      }
    }
  }
}

function bindHardEvent(materialGot) {
  $("#hardColor").empty();
  $("#hardColor").append(
    `<option disabled selected value="">Choose color...</option>`
  );
  if (materialGot == "buckram") {
    var optionsColor = { 550: "Blue", 557: "Green", 567: "Maroon" };
    var hashColor = ["#363490", "#0d693f", "#ac252c"];
  }
  if (materialGot == "arcylic") {
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
}

function toIsoString(date) {
  var pad = function (num) {
    var norm = Math.floor(Math.abs(num));
    return (norm < 10 ? "0" : "") + norm;
  };

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

async function getOrder(oid) {
  var fireDB = initFireDb();
  var orderDoc = oid;
  var docLoc = fireDB.collection("order").doc(orderDoc);
  try {
    var orderDoc = await docLoc.get();
    if (orderDoc.exists) {
      return orderDoc.data();
    } else {
      console.error("order not exists");
    }
  } catch (error) {
    console.error("got error: " + error);
  }
}

function uploadFile(orderIdGot) {
  var theFile = document.getElementById("orderFile").files[0];
  var refString = orderIdGot + "/" + theFile.name;
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
      $("#progressMessage").html(
        "Complete! Your order id is " + orderIdGot + " Please Wait for refresh"
      );
      setTimeout(() => {
        location.reload();
      }, 5000);
    }
  );
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

function bindBusinessCard() {
  $("label[for='orderQuantity']").append(" (boxes) 100 pieces/box");
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

export {
  fillPersonalInfo,
  bindCommonEvents,
  revertQtyText,
  uploadFile,
  mediumDiaglog,
  hideDialogCloseBut,
  initFire,
  initFireDb,
  showDialogCloseBut,
  loadForm,
  getOrder,
};
