/**
 * Mascote Capivara em SVG inline para PDF (react-pdf).
 * Usa <Svg> primitives ao invés de imagens externas.
 */

import { Svg, Rect, Path, Ellipse, Circle, Line, G } from "@react-pdf/renderer";

interface CapivaraLogoProps {
  width?: number;
  /** "investigando" mostra a lupa; "padrao" só o mascote. */
  pose?: "padrao" | "investigando";
}

export function CapivaraLogoPDF({ width = 80, pose = "investigando" }: CapivaraLogoProps) {
  const height = Math.round((width * 320) / 480);

  return (
    <Svg width={width} height={height} viewBox="0 0 480 320">
      {/* Patas */}
      <Rect x="358" y="208" width="28" height="62" fill="#8E4628" />
      <Rect x="378" y="240" width="36" height="20" fill="#8E4628" />
      <Rect x="138" y="208" width="28" height="62" fill="#8E4628" />
      <Rect x="120" y="240" width="36" height="20" fill="#8E4628" />

      {/* Corpo */}
      <Path
        d="M 60 168 Q 58 128 96 118 Q 118 92 156 96 Q 178 80 220 80 L 360 80 Q 420 82 432 130 Q 440 142 438 168 Q 438 215 388 220 L 110 220 Q 60 218 60 178 Z"
        fill="#C46A3F"
      />

      {/* Sombra inferior */}
      <Path
        d="M 100 200 Q 200 218 380 210 Q 410 212 420 200 L 420 220 L 100 220 Z"
        fill="#8E4628"
        opacity={0.32}
      />

      {/* Focinho */}
      <Path
        d="M 60 158 Q 58 132 96 118 Q 102 132 100 156 Q 80 162 60 170 Z"
        fill="#A05533"
      />

      {/* Orelha */}
      <Ellipse cx="178" cy="82" rx="16" ry="12" fill="#C46A3F" />
      <Ellipse cx="178" cy="84" rx="8" ry="6" fill="#8E4628" />

      {/* Olho */}
      <Circle cx="116" cy="135" r="5.5" fill="#1F1611" />
      <Circle cx="118" cy="133" r="1.6" fill="#F4EAD8" />

      {/* Narina */}
      <Ellipse cx="72" cy="142" rx="3" ry="2.2" fill="#1F1611" />

      {/* Sorriso */}
      <Path
        d="M 62 158 Q 70 162 82 160"
        stroke="#1F1611"
        strokeWidth={1.6}
        fill="none"
      />

      {/* Lupa (só na pose investigando) */}
      {pose === "investigando" && (
        <G>
          <Circle cx="34" cy="200" r="40" fill="none" stroke="#1F1611" strokeWidth={6} />
          <Circle cx="34" cy="200" r="34" fill="#E8A547" opacity={0.35} />
          <Line x1="62" y1="228" x2="92" y2="262" stroke="#1F1611" strokeWidth={8} />
        </G>
      )}
    </Svg>
  );
}

/** Versão monocromática pequena (para watermark/canto). */
export function CapivaraMonoPDF({ width = 40, color = "#C46A3F" }: { width?: number; color?: string }) {
  const height = Math.round((width * 320) / 480);
  return (
    <Svg width={width} height={height} viewBox="0 0 480 320">
      <Path
        d="M 60 168 Q 58 128 96 118 Q 118 92 156 96 Q 178 80 220 80 L 360 80 Q 420 82 432 130 Q 440 142 438 168 Q 438 215 388 220 L 110 220 Q 60 218 60 178 Z"
        fill={color}
      />
      <Ellipse cx="178" cy="82" rx="16" ry="12" fill={color} />
      <Rect x="358" y="208" width="28" height="62" fill={color} />
      <Rect x="138" y="208" width="28" height="62" fill={color} />
    </Svg>
  );
}
