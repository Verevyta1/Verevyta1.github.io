(function(){
  // Theme toggle
  var html = document.documentElement;
  var key = "theme";
  function apply(t){ html.setAttribute("data-theme", t); }
  var saved = localStorage.getItem(key);
  if (saved) apply(saved);
  var btn = document.getElementById("theme-toggle");
  if (btn){
    btn.addEventListener("click", function(){
      var current = html.getAttribute("data-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";
      apply(next); localStorage.setItem(key, next);
    });
  }

  // Build TOC from headings
  var content = document.querySelector(".post-content");
  var toc = document.getElementById("toc");
  if (content && toc){
    var hs = content.querySelectorAll("h2, h3");
    if (hs.length){
      var list = document.createElement("ul");
      var title = document.createElement("h3");
      title.textContent = "Contents";
      toc.appendChild(title);
      toc.appendChild(list);
      hs.forEach(function(h){
        if (!h.id){
          h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        }
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = h.textContent;
        li.appendChild(a);
        list.appendChild(li);
      });
    } else {
      toc.style.display = "none";
    }
  }
})();
