function reloadPage() {
    location.reload();
}

var  enableGodMode = () => {console.log("testing God Mode");}

function changeContent(file) {
    // DOM: Create the script element
    var jsElm = document.createElement("script");
    // set the type attribute
    jsElm.type = "application/javascript";
    // target the div
    jsElm.id = "canvas";
    // make the script element load file
    jsElm.src = file;
    // finally insert the element to the body element in order to load the script
    document.body.appendChild(jsElm);
}

// This would be nice to get the live BTC price from CoinMarket cap API but couldn't figure it out.
function getBtcPrice () {
    var btcPriceUsd = 11933;
    return btcPriceUsd;
}

// The below never did seem to work, the changeContent above works sort of byt places script in the body at the bottom
// function changeContent(game) {
//     switch(game)
//     {
//         case "CryptoGrab":
//             var s = document.createElement("script");
//                 s.type = "text/javascript";
//                 s.src = "js/CryptoGrab.js";
//                 s.innerHTML = null;
//                 s.id = "theGame";
//                 document.getElementById("app").innerHTML = "";
//                 document.getElementById("app").appendChild(s);
//         break;
//         case "TerrorKids":
//             var s = document.createElement("script");
//                 s.type = "text/javascript";
//                 s.src = "js/TerrorKids.js";
//                 s.innerHTML = null;
//                 s.id = "theGame";
//                 document.getElementById("app").innerHTML = "";
//                 document.getElementById("app").appendChild(s);
//         break;
//         case "99bugs":
//             var s = document.createElement("script");
//                 s.type = "text/javascript";
//                 s.src = "js/99bugs.js";
//                 s.innerHTML = null;
//                 s.id = "theGame";
//                 document.getElementById("app").innerHTML = "";
//                 document.getElementById("app").appendChild(s);
//         break;
//         default:
//         void(0);
//     }
// }