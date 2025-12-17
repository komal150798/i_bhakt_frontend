import React from "react";

/**
 * Expects planet.sign in 0..11 (0 = Aries, 1 = Taurus ... 11 = Pisces)
 * planet.longitude = ecliptic longitude in degrees (0-360)
 * planet.is_retrograde = boolean
 *
 * chartData.lagna_sign  (0..11)
 * chartData.moon_sign   (0..11)
 * chartData.planets: { Sun: Planet, Moon: Planet, ... }
 *
 * Use type="lagna" for Rasi (Lagna) chart or type="moon" for Chandra chart.
 */

/* Helpers */
const PLANET_ABBREV: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

const PLANET_COLORS: Record<string, string> = {
  Sun: "#d14747", // red
  Moon: "#8b5cf6", // purple
  Mars: "#e11d48", // pink/red
  Mercury: "#15803d", // green
  Jupiter: "#f59e0b", // amber
  Venus: "#0f172a", // dark
  Saturn: "#6b7280", // gray
  Rahu: "#b91c1c",
  Ketu: "#0f172a",
};

/* South Indian grid sign positions (common layout)
   We'll place sign indexes (0..11) at these grid boxes:
   Row0 (top):    [ 0, 1, 2, 3 ]    => signs Aries (1) .. Cancer (4)
   Row1 (middle): [11,10, 9, 4 ]    => signs Pisces(12), Aquarius(11), Capricorn(10), Leo(5)
   Row2 (bottom): [8, 7, 6, 5 ]     => signs Sagittarius(9)..Virgo(6)

   Explanation: This is the common fixed South-Indian layout.
*/
const SOUTH_GRID_SIGN_ORDER = [
  [0, 1, 2, 3],
  [11, 10, 9, 4],
  [8, 7, 6, 5],
];

type Planet = {
  longitude: number;
  sign: number; // 0..11
  is_retrograde?: boolean;
};

type ChartData = {
  lagna_sign: number;
  moon_sign: number;
  planets: Record<string, Planet>;
};

type Props = {
  chartData: ChartData;
  type: "lagna" | "moon";
  width?: number;
  height?: number;
};

export const SouthIndianChart: React.FC<Props> = ({
  chartData,
  type,
  width = 700,
  height = 520,
}) => {
  // chart area padding and box dimensions
  const pad = 28;
  const outerW = width - pad * 2;
  const outerH = height - pad * 2;
  const cols = 4;
  const rows = 3;
  const boxW = outerW / cols;
  const boxH = outerH / rows;

  // compute sign->box mapping; for moon chart we rotate signs so moon_sign becomes '1'
  // For lagna chart we show raw sign numbers (1..12)
  const rotateForMoon = (signIndex: number) => {
    // number of steps to rotate so that chartData.moon_sign becomes 0 index
    const shift = chartData.moon_sign;
    return (signIndex - shift + 12) % 12;
  };

  // Build a map from signIndex -> {cx,cy,box,displayHouseNo}
  const signPositions: Record<
    number,
    { x: number; y: number; boxRow: number; boxCol: number; displayHouse: number }
  > = {};

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const signIndex = SOUTH_GRID_SIGN_ORDER[r][c];
      // center of each box
      const x = pad + c * boxW + boxW / 2;
      const y = pad + r * boxH + boxH / 2;
      // displayHouse: if type === 'lagna' show signIndex+1, else rotate so moon sign becomes 1
      let displayHouse = signIndex + 1; // 1..12
      if (type === "moon") {
        // rotated house number: 1..12
        const rotated = rotateForMoon(signIndex); // 0..11 with Moon as 0
        displayHouse = rotated + 1;
      }
      signPositions[signIndex] = {
        x,
        y,
        boxRow: r,
        boxCol: c,
        displayHouse,
      };
    }
  }

  // Group planets by sign
  const planetsBySign: Record<number, string[]> = {};
  Object.keys(chartData.planets).forEach((pname) => {
    const p = chartData.planets[pname];
    const signIndex = p.sign % 12;
    if (!planetsBySign[signIndex]) planetsBySign[signIndex] = [];
    planetsBySign[signIndex].push(pname);
  });

  const fontBase = 14;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Birth Charts</h2>

      <svg width={width} height={height} className="bg-[#f9f5eb]">
        {/* Outer border */}
        <rect
          x={pad / 2}
          y={pad / 2}
          width={width - pad}
          height={height - pad}
          rx={6}
          ry={6}
          fill="#fbf7ec"
          stroke="#7c3f00"
          strokeWidth={4}
        />

        {/* Curved separators / grid lines - we draw boxes with slightly curved inner corners */}
        {SOUTH_GRID_SIGN_ORDER.map((rowArr, r) =>
          rowArr.map((signIndex, c) => {
            const x = pad + c * boxW;
            const y = pad + r * boxH;
            const w = boxW;
            const h = boxH;
            // Rounded rect (draw with path so inner edges look like Image 2)
            const rx = 18;
            const ry = 18;
            const path = `
              M ${x + rx}, ${y}
              H ${x + w - rx}
              Q ${x + w}, ${y} ${x + w}, ${y + ry}
              V ${y + h - ry}
              Q ${x + w}, ${y + h} ${x + w - rx}, ${y + h}
              H ${x + rx}
              Q ${x}, ${y + h} ${x}, ${y + h - ry}
              V ${y + ry}
              Q ${x}, ${y} ${x + rx}, ${y}
            `;
            return (
              <g key={`box-${r}-${c}`}>
                <path
                  d={path}
                  fill="none"
                  stroke="#7c3f00"
                  strokeWidth={2}
                  opacity={0.95}
                />
                {/* small sign number top-left inside box */}
                <text
                  x={x + 12}
                  y={y + 20}
                  fontSize={12}
                  fill="#7c3f00"
                  fontWeight={600}
                >
                  {signIndex + 1}
                </text>
              </g>
            );
          })
        )}

        {/* Place big label "Lagna Chart" or "Moon Chart" */}
        <text
          x={width / 2}
          y={24}
          textAnchor="middle"
          fontSize={18}
          fontWeight={700}
          fill="#7c3f00"
        >
          {type === "lagna" ? "Lagna Chart (Rasi Chart)" : "Moon Chart (Chandra Chart)"}
        </text>

        {/* Place sign center numbers (large) and planets */}
        {Object.keys(signPositions).map((k) => {
          const signIndex = Number(k);
          const pos = signPositions[signIndex];
          const planets = planetsBySign[signIndex] || [];
          // adjust vertical offsets to avoid overlapping planets
          const baseY = pos.y - 6; // center where sign big number sits
          // planets will be stacked vertically below the big sign no.
          return (
            <g key={`sign-${signIndex}`}>
              {/* Big sign number (centered) */}
              <text
                x={pos.x}
                y={baseY}
                textAnchor="middle"
                fontSize={28}
                fill="#7c3f00"
                fontWeight={700}
              >
                {type === "lagna" ? signIndex + 1 : pos.displayHouse}
              </text>

              {/* Planets: stacked under the big number */}
              {planets.map((pname, pi) => {
                const p = chartData.planets[pname];
                const degrees = Math.floor(((p.longitude % 30) + 30) % 30);
                const px = pos.x - boxW / 3 + (pi % 3) * 28; // small horizontal shift if multiple
                const py = baseY + 18 + Math.floor(pi / 3) * 20;
                return (
                  <g key={`planet-${pname}-${pi}`}>
                    <text
                      x={px}
                      y={py}
                      textAnchor="start"
                      fontSize={12}
                      fill="#111827"
                    >
                      {String(degrees).padStart(2, "0")}°
                    </text>

                    <text
                      x={px + 34}
                      y={py}
                      textAnchor="start"
                      fontSize={14}
                      fontWeight={700}
                      fill={PLANET_COLORS[pname] || "#000"}
                    >
                      {PLANET_ABBREV[pname] || pname.slice(0, 2)}
                    </text>

                    {p.is_retrograde && (
                      <text
                        x={px + 72}
                        y={py}
                        textAnchor="start"
                        fontSize={12}
                        fill="#7c3f00"
                      >
                        R
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SouthIndianChart;
