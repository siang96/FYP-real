import { checkLoginSatus, signOut } from "../sessionManager.js";
import { initFire } from "../sharedFunction.js";

$(document).ready(function () {
    initFire();
    checkLoginSatus();
    main();
});

function main() {
    $("#logoutButton").click(function (e) { 
        e.preventDefault();
        signOut();
    });
}