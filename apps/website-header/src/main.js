const left = document.getElementById('left-side');

const handleMouseMove = e => {
  const p = e.clientX / window.innerWidth * 100;  

  left.style.width = `${p}%`;
}

document.onmousemove = e => handleMouseMove(e);

document.ontouchmove = e => handleMouseMove(e.touches[0]);