import { useState } from "react";
import "./App.css";
import OpeningBox from "./components/OpeningBox";

function App() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleBoxOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
  };
  return (
    <div className="box-container">
      <div
        className={`card-container${isOpen ? " card-container--exploded" : ""}`}
      >
        <div className="card"></div>
        <div className="card"></div>
        <div className="card"></div>
        <div className="card"></div>
        <div className="card"></div>
        <div className="box-wrapper">
          <OpeningBox isOpen={isOpen} onOpen={handleBoxOpen} />
        </div>
      </div>
      <p className="title">Chapdo's darakbang</p>
    </div>
  );
}

export default App;
