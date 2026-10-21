import "./style.css";

document.querySelector("#app").innerHTML = `
<div class="wrapper">
  <div class="container">
    <button class="btn">Press</button>
    <span>👍 Good button pressed</span>
  </div>

  <div class="container bad">
    <button class="btn">Press</button>
    <span>👎 Bad button pressed</span>
  </div>
</div>
`;
