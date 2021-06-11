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
  var configInit = firebase.initializeApp(firebaseConfig);
  return configInit;
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

async function loadForm(orderIdObtained, buttonType, updateDetacher) {
  var order = await getOrder(orderIdObtained);
  var uid = getUid();
  var userProfile = await getProfile(uid);
  var currUsrName = userProfile.name;
  bigDiaglog();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").load(
    "../assets/html/orderForm.html",
    function (response, status, xhr) {
      if (status == "success") {
        $("#orderId").val(orderIdObtained);
        $("#formOption").val(order.orderDetail.formOption);
        loadPInfo(order.personalDetail, buttonType);
        loadOAddInfo(order.orderDetail, buttonType, order);
        $("#downButArea").hide();
        $("#progressBarArea").hide();
        $("#formOption").prop("disabled", true);
        if (buttonType == "view") {
          loadOrderStats(order.statusDetail, buttonType);
          showDialogCloseBut();
          $("#messageTitle").html("View Order");
          $("#submitButton").hide();
          if (order.statusDetail.fileId) {
            $("#downButArea").show();
            $("#downButArea").click(function (event) {
              event.preventDefault();
              downloadFile(order.statusDetail.fileId);
            });
          }
        }
        if (buttonType.match(/update/gi)) {
          $("#messageTitle").html("Update Order");
          $("#messageDialogFooter").hide();
          $("#messageDialogCloseBut").show();
        }
        if (buttonType == "updateStaff") {
          loadOrderStats(order.statusDetail, buttonType);
          mergeupdate(order, updateDetacher, currUsrName, "updateStaff");
        }
        if (buttonType == "updateUser") {
          mergeupdate(order, updateDetacher, currUsrName, "updateUser");
        }
      }
    }
  );
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
    $("#orderFile").prop("required", false);
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

function mergeupdate(oldOrder, detachGot, uNameNow, caller) {
  $("#orderForm").submit(function (e) {
    $("#messageDialogCloseBut").hide();
    detachGot();
    e.preventDefault();
    var theFile = document.getElementById("orderFile").files[0];
    var oldFileRef = oldOrder.statusDetail.fileId;
    var orderId = $("#orderId").val();
    var orderDateUp = new Date();
    var personalInfoData = $("#personalInfoArea :input").serializeArray();
    var orderInfoData = $("#orderAddInfoArea :input").serializeArray();
    var jsonDataUpdate = {};
    var orderDetail = {};
    var personalDetail = {};

    var addData = {
      orderDateUpdate: orderDateUp,
      orderStatus: "Order update placed",
      lastUserUpdate: uNameNow,
    };

    if (caller == "updateStaff") {
      var addDataRaw = $("#orderStatsArea :input").serializeArray();
      addDataRaw.forEach((dataField) => {
        addData[dataField.name] = dataField.value;
      });
      if($("#paymentstat").val()=="Paid by cash"){
        var tDay=new Date();
        addData.payDate=tDay;
      }
    }

    orderDetail["formOption"] = $("#formOption").val();

    orderInfoData.forEach((dataField) => {
      orderDetail[dataField.name] = dataField.value;
    });

    personalInfoData.forEach((dataField) => {
      personalDetail[dataField.name] = dataField.value;
    });

    if (orderDetail.orderDoubleSide != "on") {
      orderDetail.orderDoubleSide = "off";
    }

    if (orderDetail.orderDesignService != "on") {
      if (theFile) {
        var refFileString = orderId + "/" + theFile.name;
        addData["fileId"] = refFileString;
      }
      if (oldOrder.orderDetail.orderDesignService == "on") {
        addData.deisgnServiceStatus = "Service canceled";
      }
    }

    if (oldOrder.orderDetail.orderDesignService != "on") {
      if (orderDetail.orderDesignService == "on") {
        addData.deisgnServiceStatus = "Service requested";
      }
    }

    for (const key in orderDetail) {
      if (Object.hasOwnProperty.call(orderDetail, key)) {
        const element = orderDetail[key];
        const updateKey = "orderDetail." + key;
        jsonDataUpdate[updateKey] = element;
      }
    }
    for (const key in personalDetail) {
      if (Object.hasOwnProperty.call(personalDetail, key)) {
        const element = personalDetail[key];
        const updateKey = "personalDetail." + key;
        jsonDataUpdate[updateKey] = element;
      }
    }
    for (const key in addData) {
      if (Object.hasOwnProperty.call(addData, key)) {
        const element = addData[key];
        const updateKey = "statusDetail." + key;
        jsonDataUpdate[updateKey] = element;
      }
    }
    $("#submitButton").prop("disabled", true);
    $("#orderForm :input").prop("disabled", true);

    if (theFile) {
      if (oldFileRef) {
        var removeFielRef = firebase.storage().ref(oldFileRef);
        removeFielRef
          .delete()
          .then(() => {
            $("#messageContent").append("<br>Old File removed!");
          })
          .catch((error) => {
            console.error("error occur: " + error);
          });
      }
      uploadFile(orderId);
    }

    var fireDB = initFireDb();
    fireDB
      .collection("order")
      .doc(orderId)
      .update(jsonDataUpdate)
      .then(() => {
        $("#messageContent").append(
          "<br>Update Success!<br> Please Wait for reload"
        );
        setTimeout(() => {
          location.reload();
        }, 5000);
      })
      .catch(() => {
        console.error("error occur: " + error);
      });
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

function loadOAddInfo(detailRecieve, callerTypeGet, data) {
  var selectedForm = detailRecieve.formOption;
  if (selectedForm.match(/Flyers/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/flyer.html",
      function (response, status, xhr) {
        if (status == "success") {
          setDataEvent(detailRecieve, "flyer", callerTypeGet);
          fieldDisabler(callerTypeGet, data, "flyer");
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
          fieldDisabler(callerTypeGet, data, "hard");
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
          fieldDisabler(callerTypeGet, data, "bcard");
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
          fieldDisabler(callerTypeGet, data, "bunting");
        }
      }
    );
  }
}

function fieldDisabler(caller, orderDataGot, formGot) {
  if (caller == "view") {
    $("#orderFileArea").hide();
    $("#orderAddInfoArea :input").prop("disabled", true);
  }
  if (caller == "updateUser") {
    if (formGot == "bunting" || formGot == "bcard" || formGot == "flyer") {
      if (
        orderDataGot.statusDetail.deisgnServiceStatus == "Design confirmed" ||
        orderDataGot.statusDetail.deisgnServiceStatus == "Producing Design" ||
        orderDataGot.statusDetail.deisgnServiceStatus == "Service completed"
      ) {
        if (orderDataGot.orderDetail.orderDesignService == "on") {
          $("#orderDesignService").prop("disabled", true);
          $("#orderFileArea").hide();
        }
      }
    }
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
    if (data.payDate) {
      $("#payDate").val(toIsoString(data.payDate.toDate()));
    }
    $("#orderStatus").val(data.orderStatus);
    $("#deisgnServiceStatus").val(data.deisgnServiceStatus);
    $("#orderDate").val(toIsoString(data.orderDate.toDate()));
    if (data.orderDateUpdate) {
      $("#orderDateUpdate").val(toIsoString(data.orderDateUpdate.toDate()));
    }
    $("#orderEstPrice").val(data.orderEstPrice);
    $("#lastUserUpdate").val(data.lastUserUpdate);
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
  $("#progressBarArea").show();
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

function forgotPw() {
  $("#messageDialogFooter").hide();
  $("#messageTitle").html("Forgot password");
  $("#messageContent").load(
    "../assets/html/forgotPw.html",
    function (response, status, request) {
      if (status == "success") {
        $("#forgotForm").submit(function (e) {
          $("#submitButton").prop("disabled", true);
          $("#forgotForm :input").prop("disabled", true);
          e.preventDefault();
          var emailReset = $("#forgotEmail").val();
          var auth = firebase.auth();
          auth
            .sendPasswordResetEmail(emailReset)
            .then(() =>
              $("#messageContent").append(
                "<br>Reset email sent<br>Please close this dialog"
              )
            )
            .catch((error) => {
              $("#messageContent").append(
                error.message + "<br>Please close this dialog"
              );
              console.error("update auth email error " + error);
            });
        });
      }
    }
  );
}

export {
  bigDiaglog,
  forgotPw,
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
