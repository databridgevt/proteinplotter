let plotArea = document.getElementById('plot');
plotArea.style.width = "100%";
var navLinks = document.getElementsByClassName("nav-link");
var navLink;
for (var i = 0; i < navLinks.length; i++) {
   var navLink = navLinks[i];
   if (navLink.getAttribute("aria-selected") == "true") {
      navLink.style.color = "#7a7a7a";
   }
}

document.getElementById("time-files").addEventListener("change", function(event) {
   var timeFileInputElem = document.getElementById("time-files");
   var timeFiles = timeFileInputElem.files;
   if (timeFiles.length == 1) {
      document.getElementById("choose-time-files").innerHTML = '<i class="fas fa-file-upload"></i> ' + timeFiles[0].name;
   }
   else {
      document.getElementById("choose-time-files").innerHTML = '<i class="fas fa-file-upload"></i> ' + String(timeFiles.length) + " files uploaded";
   }
});

document.getElementById("res-files").addEventListener("change", function(event) {
   var resFileInputElem = document.getElementById("res-files");
   var resFiles = resFileInputElem.files;
   if (resFiles.length == 1) {
      document.getElementById("choose-res-files").innerHTML = '<i class="fas fa-file-upload"></i> ' + resFiles[0].name;
   }
   else {
      document.getElementById("choose-res-files").innerHTML = '<i class="fas fa-file-upload"></i> ' + String(resFiles.length) + " files uploaded";
   }
});


//========== ADD CHECKBOX FUNCTIONALITY ==========
$(".error-button").click(function(event) {
   var errorButtons = document.getElementsByClassName("error-button");
      for (var i = 0; i < errorButtons.length; i++) {
         if (errorButtons[i] !== event.currentTarget) {
            errorButtons[i].checked = false;
         }
      }
});

$(".xaxis-tick-display-input").click(function(event) {
   var buttons = document.getElementsByClassName("xaxis-tick-display-input");
      for (var i = 0; i < buttons.length; i++) {
         if (buttons[i] !== event.currentTarget) {
            buttons[i].checked = false;
         }
      }
});

$(".yaxis-tick-display-input").click(function(event) {
   var buttons = document.getElementsByClassName("yaxis-tick-display-input");
      for (var i = 0; i < buttons.length; i++) {
         if (buttons[i] !== event.currentTarget) {
            buttons[i].checked = false;
         }
      }
});

$(".nav-link").click(function(event) {
   var navLink = event.target;
   if (navLink.getAttribute("aria-selected") == "false") {
      switch (navLink.getAttribute("id")) {
         case "bar-tab":
            document.getElementById("bar-tab").style.color = "#7a7a7a";
            document.getElementById("line-tab").style.color = "#fff";
            break;
         case "line-tab":
            document.getElementById("line-tab").style.color = "#7a7a7a";
            document.getElementById("bar-tab").style.color = "#fff";
            break;
         case "residue-tab":
            document.getElementById("residue-tab").style.color = "#7a7a7a";
            document.getElementById("time-tab").style.color = "#fff";
            break;
         case "time-tab":
            document.getElementById("time-tab").style.color = "#7a7a7a";
            document.getElementById("residue-tab").style.color = "#fff";
            break;
         default:
            // code block
      }
   }
});

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function titleSearchDropdownClicked() {
  document.getElementsByClassName("title-dropdown-content-container")[0].classList.toggle("show");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementsByClassName("title-font-family-input-options")[0];
  filter = input.value.toUpperCase();
  div = document.getElementsByClassName("title-dropdown-content-container")[0];
  a = div.getElementsByTagName("label");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

function xaxisTitleSearchDropdownClicked() {
  document.getElementsByClassName("title-dropdown-content-container")[1].classList.toggle("show");
}

function xaxisFilterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementsByClassName("title-font-family-input-options")[1];
  filter = input.value.toUpperCase();
  div = document.getElementsByClassName("title-dropdown-content-container")[1];
  a = div.getElementsByTagName("label");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

function yaxisTitleSearchDropdownClicked() {
  document.getElementsByClassName("title-dropdown-content-container")[2].classList.toggle("show");
}

function yaxisFilterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementsByClassName("title-font-family-input-options")[2];
  filter = input.value.toUpperCase();
  div = document.getElementsByClassName("title-dropdown-content-container")[2];
  a = div.getElementsByTagName("label");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}
