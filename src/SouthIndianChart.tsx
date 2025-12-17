import React from "react";

/**
 * South Indian Chart Layout - Rectangular Grid:
 * 3 rows x 4 columns = 12 houses arranged in rectangular grid
 * Layout:
 *   Row 0: [House 1, House 2, House 3, House 4]
 *   Row 1: [House 12, House 11, House 10, House 5]
 *   Row 2: [House 9, House 8, House 7, House 6]
 */

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
  Sun: "#d14747",
  Moon: "#8b5cf6",
  Mars: "#e11d48",
  Mercury: "#15803d",
  Jupiter: "#f59e0b",
  Venus: "#0f172a",
  Saturn: "#6b7280",
  Rahu: "#b91c1c",
  Ketu: "#0f172a",
};

type Planet = {
  longitude: number;
  sign: number; // 0..11
  house: number; // 1..12
  is_retrograde?: boolean;
};

type ChartData = {
  lagna: number;
  lagna_sign: number;
  moon_sign: number;
  planets: Record<string, Planet>;
  houses: number[];
  lagna_chart_houses: number[]; // Array of 12 sign indices (0-11) for houses 1-12
  moon_chart_houses: number[]; // Array of 12 sign indices (0-11) for houses 1-12
};

type Props = {
  chartData: ChartData;
  type: "lagna" | "moon";
  width?: number;
  height?: number;
};

/* South Indian grid house positions (rectangular layout)
   Houses arranged in a 3x4 grid:
   Row 0: [House 1, House 2, House 3, House 4]
   Row 1: [House 12, House 11, House 10, House 5]
   Row 2: [House 9, House 8, House 7, House 6]
*/
const RECT_GRID_HOUSE_ORDER = [
  [1, 2, 3, 4],
  [12, 11, 10, 5],
  [9, 8, 7, 6],
];

export const SouthIndianChart: React.FC<Props> = ({
  chartData,
  type,
  width = 700,
  height = 520,
}) => {
  // Chart area padding and box dimensions
  const pad = 28;
  const outerW = width - pad * 2;
  const outerH = height - pad * 2;
  const cols = 4;
  const rows = 3;
  const boxW = outerW / cols;
  const boxH = outerH / rows;

  // Get which chart houses array to use
  const housesArray = type === "moon" ? chartData.moon_chart_houses : chartData.lagna_chart_houses;

  // Create mapping: house number (1-12) -> sign index (0-11)
  const houseToSign: Record<number, number> = {};
  housesArray.forEach((signIndex, idx) => {
    houseToSign[idx + 1] = signIndex;
  });

  // Build a map from house number -> {x, y, boxRow, boxCol}
  const housePositions: Record<
    number,
    { x: number; y: number; boxRow: number; boxCol: number; signIndex: number; displayHouse: number }
  > = {};

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const houseNumber = RECT_GRID_HOUSE_ORDER[r][c];
      const signIndex = houseToSign[houseNumber] ?? 0;
      // Center of each box
      const x = pad + c * boxW + boxW / 2;
      const y = pad + r * boxH + boxH / 2;
      housePositions[houseNumber] = {
        x,
        y,
        boxRow: r,
        boxCol: c,
        signIndex,
        displayHouse: houseNumber,
      };
    }
  }

  // Get planets in houses
  const planetsInHouses: Record<number, string[]> = {};
  Object.entries(chartData.planets).forEach(([planetName, planetData]) => {
    let house: number;
    if (type === "moon") {
      // For Moon chart: find which house contains this planet's sign
      const planetSign = planetData.sign;
      house = housesArray.findIndex((signIndex) => signIndex === planetSign) + 1;
      if (house === 0) house = 12; // Handle case when not found
    } else {
      // For Lagna chart: use the house from planet data
      house = planetData.house;
    }
    if (!planetsInHouses[house]) planetsInHouses[house] = [];
    planetsInHouses[house].push(planetName);
  });

  const fontBase = 14;

  return (
    <div className="flex flex-col items-center print:break-inside-avoid">
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

        {/* Draw rectangular boxes for each house */}
        {RECT_GRID_HOUSE_ORDER.map((rowArr, r) =>
          rowArr.map((houseNumber, c) => {
            const pos = housePositions[houseNumber];
            const x = pad + c * boxW;
            const y = pad + r * boxH;
            const w = boxW;
            const h = boxH;
            
            // Rounded rectangle
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
            
            const planets = planetsInHouses[houseNumber] || [];
            const signNumber = pos.signIndex + 1;

            return (
              <g key={`house-${houseNumber}`}>
                {/* House border (rounded rectangle) */}
                <path
                  d={path}
                  fill="none"
                  stroke="#7c3f00"
                  strokeWidth={2}
                  opacity={0.95}
                />
                
                {/* Small house number label (top-left) */}
                <text
                  x={x + 12}
                  y={y + 20}
                  fontSize={12}
                  fill="#7c3f00"
                  fontWeight={600}
                >
                  {houseNumber}
                </text>

                {/* Big sign number (centered) */}
                <text
                  x={pos.x}
                  y={pos.y - 6}
                  textAnchor="middle"
                  fontSize={28}
                  fill="#7c3f00"
                  fontWeight={700}
                >
                  {signNumber}
                </text>

                {/* Planets: stacked below the big sign number */}
                {planets.map((pname, pi) => {
                  const p = chartData.planets[pname];
                  const degrees = Math.floor(((p.longitude % 30) + 30) % 30);
                  const px = pos.x - boxW / 3 + (pi % 3) * 28; // Small horizontal shift if multiple
                  const py = pos.y + 18 + Math.floor(pi / 3) * 20;
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
          })
        )}

        {/* Chart title */}
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
      </svg>
    </div>
  );
};

export default SouthIndianChart;
