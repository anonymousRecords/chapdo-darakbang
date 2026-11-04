import { TRI_POINTS } from "../constant";

export function DefsTriangles() {
  return (
    <clipPath id="tri-clip" clipPathUnits="userSpaceOnUse">
      {TRI_POINTS.map((points) => (
        <polygon key={`tri-${points}`} points={points} />
      ))}
    </clipPath>
  );
}
