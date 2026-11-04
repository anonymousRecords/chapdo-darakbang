let index = 0,
  interval = 5000;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const animate = (leaves) => {
  leaves.style.setProperty("--leaves-left", `${rand(-10, 100)}%`);
  leaves.style.setProperty("--leaves-top", `${rand(-40, 80)}%`);

  leaves.style.animation = "none";
  leaves.offsetHeight;
  leaves.style.animation = "";
};

for (const leaves of document.getElementsByClassName("autumn-leaves")) {
  setTimeout(
    () => {
      animate(leaves);

      setInterval(() => animate(leaves), 1000);
    },
    index++ * (interval / 3)
  );
}
