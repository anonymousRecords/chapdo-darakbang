const MOBILE_BREAKPOINT = 768;
const DEFAULT_MESSAGE = "데스크탑 환경에서만 접속 가능해요.";

function checkDesktopOnly(message = DEFAULT_MESSAGE) {
  function showMobileBlock() {
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        padding: 20px;
        text-align: center;
        font-family: system-ui, sans-serif;
        box-sizing: border-box;
      ">
        <p style="font-size: 18px; color: #333; margin: 0;">${message}</p>
      </div>
    `;
  }

  function checkWidth() {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      showMobileBlock();
    }
  }

  checkWidth();
  window.addEventListener("resize", checkWidth);
}

checkDesktopOnly();
