/**
 * HeroMascot — capivara investigando com animacao elaborada.
 *
 * Camadas animadas independentes:
 *   - shadow: contrai/expande conforme corpo sobe/desce (puxa profundidade)
 *   - body: bob vertical suave (3.2s)
 *   - ear: vibracao sutil (twitch ocasional)
 *   - eye: pisca a cada 4-5s
 *   - magnifier: scan motion (vai/volta horizontal, alem do bob)
 *   - sparkles: 3 estrelinhas douradas pulsando em fases diferentes
 *
 * SVG inline (em vez de <Image>) garante:
 *   - Animacoes CSS por elemento (impossivel com <img>)
 *   - Aspect ratio 3:2 respeitado (sem corte/esticamento)
 */

import { cn } from "@/lib/utils";

interface HeroMascotProps {
  /** Largura final em px. Altura e calculada proporcionalmente (3:2). */
  width?: number;
  className?: string;
}

export function HeroMascot({ width = 480, className }: HeroMascotProps) {
  const height = Math.round((width * 320) / 480);

  return (
    <svg
      role="img"
      aria-label="Capivara investigando com lupa"
      viewBox="0 0 480 320"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      style={{ display: "block" }}
    >
      <defs>
        {/* Glow ao redor da lupa */}
        <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8A547" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#E8A547" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#E8A547" stopOpacity="0" />
        </radialGradient>

        <style>{`
          .capi-body  { animation: capi-bob   3.2s ease-in-out infinite; transform-origin: 240px 220px; }
          .capi-shadow{ animation: capi-shadow 3.2s ease-in-out infinite; transform-origin: 240px 270px; }
          .capi-ear   { animation: capi-twitch 4.6s ease-in-out infinite; transform-origin: 178px 90px; }
          .capi-eye   { animation: capi-blink  4.2s ease-in-out infinite; transform-origin: 117px 135px; }
          .capi-mag   { animation: capi-scan   2.8s ease-in-out infinite; transform-origin: 34px 200px; }
          .capi-glow  { animation: capi-glow   2.8s ease-in-out infinite; transform-origin: 34px 200px; }
          .capi-spark-1 { animation: capi-spark 1.8s ease-in-out infinite; transform-origin: 90px 130px; }
          .capi-spark-2 { animation: capi-spark 2.2s ease-in-out infinite 0.4s; transform-origin: 50px 240px; }
          .capi-spark-3 { animation: capi-spark 2.0s ease-in-out infinite 1.0s; transform-origin: 12px 180px; }

          @keyframes capi-bob {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-6px); }
          }
          @keyframes capi-shadow {
            0%, 100% { transform: scaleX(1)    scaleY(1); opacity: 1; }
            50%      { transform: scaleX(0.92) scaleY(0.85); opacity: 0.75; }
          }
          @keyframes capi-twitch {
            0%, 88%, 100% { transform: rotate(0deg); }
            92%           { transform: rotate(-4deg); }
            96%           { transform: rotate(3deg); }
          }
          @keyframes capi-blink {
            0%, 92%, 100% { transform: scaleY(1); }
            95%, 96%      { transform: scaleY(0.1); }
          }
          @keyframes capi-scan {
            0%, 100% { transform: translateX(0)    translateY(0); }
            50%      { transform: translateX(-4px) translateY(-3px); }
          }
          @keyframes capi-glow {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50%      { opacity: 0.95; transform: scale(1.08); }
          }
          @keyframes capi-spark {
            0%, 100% { opacity: 0;   transform: scale(0.4) rotate(0deg); }
            40%      { opacity: 1;   transform: scale(1)   rotate(45deg); }
            60%      { opacity: 1;   transform: scale(1.1) rotate(90deg); }
            100%     { opacity: 0;   transform: scale(0.4) rotate(180deg); }
          }

          @media (prefers-reduced-motion: reduce) {
            .capi-body, .capi-shadow, .capi-ear, .capi-eye, .capi-mag,
            .capi-glow, .capi-spark-1, .capi-spark-2, .capi-spark-3 {
              animation: none;
            }
          }
        `}</style>
      </defs>

      {/* Sombra no chao (separada, escala com o bob) */}
      <ellipse
        className="capi-shadow"
        cx="240"
        cy="280"
        rx="180"
        ry="10"
        fill="#1F1611"
        opacity="0.18"
      />

      {/* Corpo todo (bob junto) */}
      <g className="capi-body">
        {/* Patas */}
        <rect x="358" y="208" width="28" height="62" rx="10" fill="#8E4628" />
        <rect x="378" y="240" width="36" height="20" rx="6" fill="#8E4628" />
        <rect x="138" y="208" width="28" height="62" rx="10" fill="#8E4628" />
        <rect x="120" y="240" width="36" height="20" rx="6" fill="#8E4628" />

        {/* Corpo */}
        <path
          d="M 60 168 Q 58 128 96 118 Q 118 92 156 96 Q 178 80 220 80 L 360 80 Q 420 82 432 130 Q 440 142 438 168 Q 438 215 388 220 L 110 220 Q 60 218 60 178 Z"
          fill="#C46A3F"
        />

        {/* Sombra inferior do corpo */}
        <path
          d="M 100 200 Q 200 218 380 210 Q 410 212 420 200 L 420 220 L 100 220 Z"
          fill="#8E4628"
          opacity="0.32"
        />

        {/* Focinho */}
        <path
          d="M 60 158 Q 58 132 96 118 Q 102 132 100 156 Q 80 162 60 170 Z"
          fill="#A05533"
        />

        {/* Orelha (twitch) */}
        <g className="capi-ear">
          <ellipse cx="178" cy="82" rx="16" ry="12" fill="#C46A3F" />
          <ellipse cx="178" cy="84" rx="8" ry="6" fill="#8E4628" />
        </g>

        {/* Olho (blink) */}
        <g className="capi-eye">
          <circle cx="116" cy="135" r="5.5" fill="#1F1611" />
          <circle cx="118" cy="133" r="1.6" fill="#F4EAD8" />
        </g>

        {/* Narina */}
        <ellipse cx="72" cy="142" rx="3" ry="2.2" fill="#1F1611" />

        {/* Sorriso */}
        <path
          d="M 62 158 Q 70 162 82 160"
          stroke="#1F1611"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Lupa (scan motion + glow pulsando) */}
      <g className="capi-mag">
        {/* Glow ao redor */}
        <circle
          className="capi-glow"
          cx="34"
          cy="200"
          r="50"
          fill="url(#lensGlow)"
        />
        {/* Aro da lupa */}
        <circle
          cx="34"
          cy="200"
          r="40"
          fill="none"
          stroke="#1F1611"
          strokeWidth="6"
        />
        {/* Lente */}
        <circle cx="34" cy="200" r="34" fill="#F4EAD8" opacity="0.35" />
        {/* Cabo */}
        <line
          x1="62"
          y1="228"
          x2="92"
          y2="262"
          stroke="#1F1611"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* Sparkles dourados ao redor */}
      <g className="capi-spark-1">
        <Sparkle cx={90} cy={130} size={6} />
      </g>
      <g className="capi-spark-2">
        <Sparkle cx={50} cy={240} size={5} />
      </g>
      <g className="capi-spark-3">
        <Sparkle cx={12} cy={180} size={4} />
      </g>
    </svg>
  );
}

/** Estrela de 4 pontas em formato '+'. */
function Sparkle({
  cx,
  cy,
  size,
}: {
  cx: number;
  cy: number;
  size: number;
}) {
  const s = size;
  return (
    <path
      d={`M ${cx} ${cy - s * 2}
          L ${cx + s * 0.4} ${cy - s * 0.4}
          L ${cx + s * 2} ${cy}
          L ${cx + s * 0.4} ${cy + s * 0.4}
          L ${cx} ${cy + s * 2}
          L ${cx - s * 0.4} ${cy + s * 0.4}
          L ${cx - s * 2} ${cy}
          L ${cx - s * 0.4} ${cy - s * 0.4}
          Z`}
      fill="#E8A547"
    />
  );
}
