import { WALK_PATH, WALK_S, WALK_X, WALK_Y } from "../constant";

export function DefsWalk() {
  return (
    <clipPath id="walk-clip" clipPathUnits="userSpaceOnUse">
      <path
        d={WALK_PATH}
        transform={`translate(${
          WALK_X + 100 * WALK_S
        }, ${WALK_Y}) scale(${-WALK_S}, ${WALK_S})`}
      />
    </clipPath>
  );
}
