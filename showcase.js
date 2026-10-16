(function () {
  "use strict";

  var dialog = document.getElementById("demo-dialog");
  var frame = document.getElementById("demo-frame");
  var title = document.getElementById("dialog-title");
  var full = document.getElementById("open-full");
  var currentUrl = "";

  document.querySelectorAll(".filter").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".filter").forEach(function (item) {
        item.classList.toggle("active", item === button);
      });

      var selected = button.dataset.filter;
      document.querySelectorAll(".project-card").forEach(function (card) {
        var categories = card.dataset.category.split(" ");
        card.classList.toggle("hidden", selected !== "all" && categories.indexOf(selected) === -1);
      });
    });
  });

  document.querySelectorAll(".open-demo").forEach(function (button) {
    button.addEventListener("click", function () {
      currentUrl = button.dataset.demo;
      frame.src = currentUrl;
      title.textContent = button.dataset.title;
      full.href = currentUrl;
      dialog.showModal();
      document.body.style.overflow = "hidden";
    });
  });

  document.getElementById("reload-demo").addEventListener("click", function () {
    frame.src = "about:blank";
    window.setTimeout(function () { frame.src = currentUrl; }, 30);
  });

  document.getElementById("close-demo").addEventListener("click", function () {
    dialog.close();
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", function () {
    frame.src = "about:blank";
    document.body.style.overflow = "";
  });
}());
