import "./style.css";

document.querySelector("#app").innerHTML = `
  <section>
    <div class="wrapper">
      <div class="container" aria-label="Good tooltips">
        <div class="item">
          <div class="tooltip" role="tooltip">music</div>
          <button>🎵</button>
        </div>
        <div class="item">
          <div class="tooltip" role="tooltip">writing</div>
          <button>✍️</button>
        </div>
        <div class="item">
          <div class="tooltip" role="tooltip">shining</div>
          <button>✨</button>
        </div>
      </div>

      <p>👍 Good tooltip delay</p>
    </div>

    <div class="wrapper">
      <div class="container bad" aria-label="Bad tooltips">
        <div class="item">
          <div class="tooltip" role="tooltip">music</div>
          <button>🎵</button>
        </div>
        <div class="item">
          <div class="tooltip" role="tooltip">writing</div>
          <button>✍️</button>
        </div>
        <div class="item">
          <div class="tooltip" role="tooltip">shining</div>
          <button>✨</button>
        </div>
      </div>

      <p>👎 Bad tooltip delay</p>
    </div>
  </section>
`;

/* -------------------- GOOD -------------------- */
let primed = false;
const timers = new Map();

const goodGroup = document.querySelector(".container:not(.bad)");
const goodButtons = goodGroup.querySelectorAll("button");

let groupLeaveTimer;
goodGroup.addEventListener("mouseleave", () => {
  clearTimeout(groupLeaveTimer);
  groupLeaveTimer = setTimeout(() => (primed = false), 300);
});

goodButtons.forEach((btn) => {
  btn.addEventListener("mouseenter", () => onEnter(btn));
  btn.addEventListener("mouseleave", () => onLeave(btn));
  btn.addEventListener("focus", () => onEnter(btn));
  btn.addEventListener("blur", () => onLeave(btn));
});

function onEnter(btn) {
  hideSiblings(btn);

  if (primed) {
    showTooltip(btn, { noAnim: true });
  } else {
    const t = setTimeout(() => {
      showTooltip(btn);
      primed = true;
    }, 300);
    timers.set(btn, t);
  }
}

function onLeave(btn) {
  const t = timers.get(btn);
  if (t) {
    clearTimeout(t);
    timers.delete(btn);
  }
  hideTooltip(btn);
}

/* -------------------- BAD -------------------- */
const badButtons = document.querySelectorAll(".container.bad button");
const badTimers = new Map();

badButtons.forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    hideSiblings(btn);
    const t = setTimeout(() => showTooltip(btn), 300);
    badTimers.set(btn, t);
  });
  btn.addEventListener("mouseleave", () => {
    const t = badTimers.get(btn);
    if (t) {
      clearTimeout(t);
      badTimers.delete(btn);
    }
    hideTooltip(btn);
  });
});

/* -------------------- Helpers -------------------- */
function showTooltip(el, opts = {}) {
  const tip = el.previousElementSibling;
  if (!tip) return;

  if (opts.noAnim) {
    tip.classList.add("no-anim");
    requestAnimationFrame(() => {
      tip.classList.add("visible");
      requestAnimationFrame(() => tip.classList.remove("no-anim"));
    });
  } else {
    tip.classList.add("visible");
  }
}

function hideTooltip(el) {
  el?.previousElementSibling?.classList.remove("visible");
}

function hideSiblings(el) {
  const group = el.closest(".container");
  group?.querySelectorAll(".tooltip.visible").forEach((tip) => {
    if (tip !== el.previousElementSibling) tip.classList.remove("visible");
  });
}
