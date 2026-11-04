"use client";

import "./OpeningBox.css";
interface OpeningBoxProps {
  isOpen: boolean;
  onOpen: () => void;
}

const OpeningBox = ({ isOpen, onOpen }: OpeningBoxProps) => {
  return (
    <div onClick={onOpen} className={`scene${isOpen ? " scene--opened" : ""}`}>
      <div className="box-3d">
        {/* 뚜껑 (Flaps) */}
        <div className="lid-layer">
          <div className="flap flap-left"></div>
          <div className="flap flap-right"></div>
          <div className="flap flap-top"></div>
          <div className="flap flap-bottom"></div>
        </div>

        {/* 상자 몸통 */}
        <div className="face face-front"></div>
        <div className="face face-back"></div>
        <div className="face face-left"></div>
        <div className="face face-right"></div>
        <div className="face face-bottom"></div>
      </div>
    </div>
  );
};

export default OpeningBox;
