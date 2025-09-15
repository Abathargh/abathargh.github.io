var theme = "dark";

function switch_theme(elem) {
  var css = document.getElementById("stylesheet");
  if(theme === "light") {
    css.setAttribute("href", "style_dark.css");
    theme = "dark";
  } else {
    css.setAttribute("href", "style.css");
    theme = "light";
  }
}