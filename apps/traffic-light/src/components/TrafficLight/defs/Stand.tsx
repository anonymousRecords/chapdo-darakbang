import { STAND_PATH, STAND_S, STAND_X, STAND_Y } from "../constant";

export function DefsStand() {
  return (
    <clipPath id="stand-clip" clipPathUnits="userSpaceOnUse">
      <path
        d={STAND_PATH}
        transform={`translate(${STAND_X}, ${STAND_Y}) scale(${STAND_S})`}
      />
    </clipPath>
  );
}
