/**
 * CategoriaHeroMascot — capivara contextualizada por categoria (CPF/CNPJ/Veicular).
 *
 * Cada categoria tem um cenario:
 *   - cpf:      capivara + documento RG (linhas + foto + label "CPF")
 *   - cnpj:     capivara + predio comercial + pasta de contrato
 *   - veicular: capivara + carro estilizado + placa
 *
 * Animacoes (mantidas do HeroMascot original):
 *   - body bob (3.2s)
 *   - shadow scale
 *   - ear twitch
 *   - eye blink
 *   - lupa scan + glow
 *   - sparkles
 *
 * viewBox 0 0 560 360 (1.555:1 aspect) — generoso pra nao cortar elementos
 * contextuais ao redor da capivara.
 */

import { cn } from "@/lib/utils";

export type CategoriaContexto = "cpf" | "cnpj" | "veicular";

interface CategoriaHeroMascotProps {
  category: CategoriaContexto;
  width?: number;
  className?: string;
}

export function CategoriaHeroMascot({
  category,
  width = 560,
  className,
}: CategoriaHeroMascotProps) {
  const height = Math.round((width * 360) / 560);

  return (
    <svg
      role="img"
      aria-label={ariaLabel(category)}
      viewBox="0 0 560 360"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8A547" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#E8A547" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#E8A547" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="docGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFCF5" />
          <stop offset="100%" stopColor="#F4EAD8" />
        </linearGradient>

        <style>{`
          .capi-body  { animation: capi-bob   3.2s ease-in-out infinite; transform-origin: 290px 230px; }
          .capi-shadow{ animation: capi-shadow 3.2s ease-in-out infinite; transform-origin: 290px 295px; }
          .capi-ear   { animation: capi-twitch 4.6s ease-in-out infinite; transform-origin: 228px 100px; }
          .capi-eye   { animation: capi-blink  4.2s ease-in-out infinite; transform-origin: 167px 145px; }
          .capi-mag   { animation: capi-scan   2.8s ease-in-out infinite; transform-origin: 84px 210px; }
          .capi-glow  { animation: capi-glow   2.8s ease-in-out infinite; transform-origin: 84px 210px; }
          .capi-spark-1 { animation: capi-spark 1.8s ease-in-out infinite; transform-origin: 140px 140px; }
          .capi-spark-2 { animation: capi-spark 2.2s ease-in-out infinite 0.4s; transform-origin: 100px 250px; }
          .capi-spark-3 { animation: capi-spark 2.0s ease-in-out infinite 1.0s; transform-origin: 62px 190px; }
          .ctx-float  { animation: ctx-float   4.6s ease-in-out infinite; }
          .ctx-float-2 { animation: ctx-float  5.2s ease-in-out infinite 0.6s; }

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
          @keyframes ctx-float {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-4px); }
          }

          @media (prefers-reduced-motion: reduce) {
            .capi-body, .capi-shadow, .capi-ear, .capi-eye, .capi-mag,
            .capi-glow, .capi-spark-1, .capi-spark-2, .capi-spark-3,
            .ctx-float, .ctx-float-2 {
              animation: none;
            }
          }
        `}</style>
      </defs>

      {/* Contexto FUNDO (atras da capivara) */}
      {category === "cnpj" && <PredioContexto />}
      {category === "veicular" && <CarroFundoContexto />}

      {/* Sombra no chao */}
      <ellipse
        className="capi-shadow"
        cx="290"
        cy="300"
        rx="180"
        ry="10"
        fill="#1F1611"
        opacity="0.18"
      />

      {/* Corpo todo (bob junto) */}
      <g className="capi-body">
        {/* Patas */}
        <rect x="408" y="228" width="28" height="62" rx="10" fill="#8E4628" />
        <rect x="428" y="260" width="36" height="20" rx="6" fill="#8E4628" />
        <rect x="188" y="228" width="28" height="62" rx="10" fill="#8E4628" />
        <rect x="170" y="260" width="36" height="20" rx="6" fill="#8E4628" />

        {/* Corpo */}
        <path
          d="M 110 188 Q 108 148 146 138 Q 168 112 206 116 Q 228 100 270 100 L 410 100 Q 470 102 482 150 Q 490 162 488 188 Q 488 235 438 240 L 160 240 Q 110 238 110 198 Z"
          fill="#C46A3F"
        />

        {/* Sombra inferior do corpo */}
        <path
          d="M 150 220 Q 250 238 430 230 Q 460 232 470 220 L 470 240 L 150 240 Z"
          fill="#8E4628"
          opacity="0.32"
        />

        {/* Focinho */}
        <path
          d="M 110 178 Q 108 152 146 138 Q 152 152 150 176 Q 130 182 110 190 Z"
          fill="#A05533"
        />

        {/* Orelha (twitch) */}
        <g className="capi-ear">
          <ellipse cx="228" cy="102" rx="16" ry="12" fill="#C46A3F" />
          <ellipse cx="228" cy="104" rx="8" ry="6" fill="#8E4628" />
        </g>

        {/* Olho (blink) */}
        <g className="capi-eye">
          <circle cx="166" cy="155" r="5.5" fill="#1F1611" />
          <circle cx="168" cy="153" r="1.6" fill="#F4EAD8" />
        </g>

        {/* Narina */}
        <ellipse cx="122" cy="162" rx="3" ry="2.2" fill="#1F1611" />

        {/* Sorriso */}
        <path
          d="M 112 178 Q 120 182 132 180"
          stroke="#1F1611"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Lupa */}
      <g className="capi-mag">
        <circle className="capi-glow" cx="84" cy="220" r="50" fill="url(#lensGlow)" />
        <circle cx="84" cy="220" r="40" fill="none" stroke="#1F1611" strokeWidth="6" />
        <circle cx="84" cy="220" r="34" fill="#F4EAD8" opacity="0.35" />
        <line
          x1="112"
          y1="248"
          x2="142"
          y2="282"
          stroke="#1F1611"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* Sparkles */}
      <g className="capi-spark-1"><Sparkle cx={140} cy={140} size={6} /></g>
      <g className="capi-spark-2"><Sparkle cx={100} cy={250} size={5} /></g>
      <g className="capi-spark-3"><Sparkle cx={62} cy={190} size={4} /></g>

      {/* Contexto FRENTE (acima da capivara) */}
      {category === "cpf" && <DocumentoCPFContexto />}
      {category === "cnpj" && <PastaContratoContexto />}
      {category === "veicular" && <PlacaCarroContexto />}
    </svg>
  );
}

// ============================================================================
// Contextos por categoria
// ============================================================================

/** CPF: documento estilizado flutuando ao lado da capivara */
function DocumentoCPFContexto() {
  return (
    <g className="ctx-float">
      {/* Card RG/CPF */}
      <g transform="translate(380, 80)">
        {/* Sombra */}
        <rect
          x="3"
          y="5"
          width="140"
          height="100"
          rx="8"
          fill="#1F1611"
          opacity="0.18"
        />
        {/* Card */}
        <rect
          width="140"
          height="100"
          rx="8"
          fill="url(#docGradient)"
          stroke="#C46A3F"
          strokeWidth="2"
        />
        {/* Header colorido */}
        <rect width="140" height="20" rx="8" fill="#C46A3F" />
        <rect y="14" width="140" height="6" fill="#C46A3F" />
        {/* Label CPF */}
        <text
          x="10"
          y="15"
          fontSize="11"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
          fill="#FFFCF5"
        >
          CPF
        </text>
        {/* Foto */}
        <rect
          x="10"
          y="30"
          width="30"
          height="38"
          rx="3"
          fill="#E6D8BD"
          stroke="#8E4628"
          strokeWidth="1"
        />
        <circle cx="25" cy="42" r="6" fill="#8E4628" opacity="0.6" />
        <path
          d="M 14 60 Q 25 53 36 60 L 36 65 L 14 65 Z"
          fill="#8E4628"
          opacity="0.6"
        />
        {/* Linhas de dados */}
        <rect x="48" y="32" width="80" height="4" rx="1" fill="#8E4628" opacity="0.5" />
        <rect x="48" y="42" width="64" height="4" rx="1" fill="#8E4628" opacity="0.4" />
        <rect x="48" y="52" width="74" height="4" rx="1" fill="#8E4628" opacity="0.4" />
        <rect x="48" y="62" width="50" height="4" rx="1" fill="#8E4628" opacity="0.4" />
        {/* CPF number */}
        <rect
          x="10"
          y="78"
          width="120"
          height="14"
          rx="2"
          fill="#1F1611"
          opacity="0.06"
        />
        <text
          x="14"
          y="89"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
          fill="#1F1611"
        >
          123.456.789-00
        </text>
      </g>

      {/* Check verde indicando "OK" */}
      <g transform="translate(490, 60)">
        <circle r="14" fill="#5E7C4F" />
        <path
          d="M -6 0 L -2 4 L 6 -4"
          stroke="#FFFCF5"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

/** CNPJ: predio comercial FUNDO + pasta de contrato FRENTE */
function PredioContexto() {
  return (
    <g opacity="0.85">
      {/* Predio principal */}
      <g transform="translate(420, 120)">
        {/* Sombra base */}
        <rect x="2" y="110" width="100" height="6" fill="#1F1611" opacity="0.15" />
        {/* Estrutura */}
        <rect x="0" y="0" width="100" height="120" rx="3" fill="#8E4628" />
        <rect x="0" y="0" width="100" height="120" rx="3" fill="#C46A3F" opacity="0.85" />
        {/* Topo */}
        <rect x="-4" y="-6" width="108" height="8" fill="#1F1611" />
        {/* Janelas grid 4x6 */}
        {Array.from({ length: 6 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => {
            const lit = (row + col) % 3 === 0;
            return (
              <rect
                key={`w-${row}-${col}`}
                x={10 + col * 22}
                y={12 + row * 18}
                width="14"
                height="10"
                rx="1"
                fill={lit ? "#E8A547" : "#1F1611"}
                opacity={lit ? "0.9" : "0.5"}
              />
            );
          })
        )}
        {/* Entrada */}
        <rect x="38" y="100" width="24" height="20" rx="2" fill="#1F1611" opacity="0.65" />
      </g>

      {/* Predio menor atras */}
      <g transform="translate(490, 160)" opacity="0.6">
        <rect width="60" height="80" rx="2" fill="#A05533" />
        <rect x="-4" y="-4" width="68" height="6" fill="#1F1611" />
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 3 }, (_, col) => (
            <rect
              key={`w2-${row}-${col}`}
              x={6 + col * 16}
              y={10 + row * 16}
              width="10"
              height="8"
              rx="1"
              fill="#1F1611"
              opacity="0.55"
            />
          ))
        )}
      </g>
    </g>
  );
}

/** CNPJ: pasta de contrato flutuando na frente */
function PastaContratoContexto() {
  return (
    <g className="ctx-float-2">
      <g transform="translate(380, 90)">
        {/* Sombra */}
        <rect x="3" y="5" width="100" height="120" rx="6" fill="#1F1611" opacity="0.18" />
        {/* Pasta */}
        <rect
          width="100"
          height="120"
          rx="6"
          fill="url(#docGradient)"
          stroke="#C46A3F"
          strokeWidth="2"
        />
        {/* Aba topo */}
        <path d="M 18 0 L 82 0 L 90 8 L 10 8 Z" fill="#C46A3F" />
        {/* Title */}
        <rect x="10" y="20" width="80" height="6" rx="1" fill="#1F1611" opacity="0.8" />
        {/* Selo CNPJ */}
        <g transform="translate(50, 50)">
          <circle r="12" fill="none" stroke="#C46A3F" strokeWidth="1.5" />
          <text
            textAnchor="middle"
            y="3"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
            fontWeight="700"
            fill="#C46A3F"
          >
            CNPJ
          </text>
        </g>
        {/* Linhas */}
        <rect x="10" y="76" width="80" height="3" rx="1" fill="#8E4628" opacity="0.45" />
        <rect x="10" y="84" width="68" height="3" rx="1" fill="#8E4628" opacity="0.45" />
        <rect x="10" y="92" width="74" height="3" rx="1" fill="#8E4628" opacity="0.45" />
        <rect x="10" y="100" width="50" height="3" rx="1" fill="#8E4628" opacity="0.45" />
        {/* Assinatura */}
        <path
          d="M 10 112 Q 20 108 30 112 T 50 112 T 70 110"
          stroke="#1F1611"
          strokeWidth="1.4"
          fill="none"
          opacity="0.7"
        />
      </g>
    </g>
  );
}

/** Veicular: carro estilizado no fundo */
function CarroFundoContexto() {
  return (
    <g opacity="0.85" transform="translate(380, 160)">
      {/* Sombra */}
      <ellipse cx="80" cy="100" rx="78" ry="6" fill="#1F1611" opacity="0.2" />
      {/* Carroceria base */}
      <path
        d="M 0 75 L 16 75 L 28 50 Q 36 38 56 38 L 104 38 Q 124 38 132 50 L 144 75 L 160 75 L 160 92 Q 158 96 152 96 L 8 96 Q 2 96 0 92 Z"
        fill="#C46A3F"
      />
      {/* Reflexo */}
      <path
        d="M 12 75 L 26 53 Q 34 44 54 44 L 74 44 L 74 75 Z"
        fill="#E8A547"
        opacity="0.4"
      />
      {/* Vidros */}
      <path
        d="M 32 70 L 40 52 Q 44 46 56 46 L 76 46 L 76 70 Z"
        fill="#F4EAD8"
        opacity="0.7"
      />
      <path
        d="M 80 46 L 100 46 Q 116 46 124 56 L 130 70 L 80 70 Z"
        fill="#F4EAD8"
        opacity="0.7"
      />
      {/* Faixa central */}
      <rect x="76" y="46" width="4" height="24" fill="#8E4628" />
      {/* Rodas */}
      <g>
        <circle cx="32" cy="96" r="11" fill="#1F1611" />
        <circle cx="32" cy="96" r="5" fill="#8E4628" />
      </g>
      <g>
        <circle cx="128" cy="96" r="11" fill="#1F1611" />
        <circle cx="128" cy="96" r="5" fill="#8E4628" />
      </g>
      {/* Farol */}
      <ellipse cx="155" cy="80" rx="3" ry="4" fill="#E8A547" />
    </g>
  );
}

/** Veicular: placa Mercosul flutuando */
function PlacaCarroContexto() {
  return (
    <g className="ctx-float">
      <g transform="translate(400, 100)">
        {/* Sombra */}
        <rect x="3" y="5" width="120" height="42" rx="5" fill="#1F1611" opacity="0.18" />
        {/* Placa */}
        <rect
          width="120"
          height="42"
          rx="5"
          fill="url(#docGradient)"
          stroke="#1F1611"
          strokeWidth="2"
        />
        {/* Header azul Mercosul */}
        <rect width="120" height="10" rx="5" fill="#2E5C8A" />
        <rect y="5" width="120" height="6" fill="#2E5C8A" />
        {/* Estrelas mercosul */}
        <circle cx="10" cy="5" r="1.2" fill="#FFFCF5" />
        <circle cx="14" cy="5" r="1.2" fill="#FFFCF5" />
        <circle cx="18" cy="5" r="1.2" fill="#FFFCF5" />
        <circle cx="22" cy="5" r="1.2" fill="#FFFCF5" />
        {/* BR label */}
        <text
          x="60"
          y="8.5"
          textAnchor="middle"
          fontSize="6"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
          fill="#FFFCF5"
        >
          BRASIL
        </text>
        {/* Plate text */}
        <text
          x="60"
          y="32"
          textAnchor="middle"
          fontSize="18"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
          fill="#1F1611"
          letterSpacing="2"
        >
          ABC1D23
        </text>
      </g>

      {/* Check verde indicando "OK" */}
      <g transform="translate(496, 76)">
        <circle r="14" fill="#5E7C4F" />
        <path
          d="M -6 0 L -2 4 L 6 -4"
          stroke="#FFFCF5"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

function Sparkle({ cx, cy, size }: { cx: number; cy: number; size: number }) {
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

function ariaLabel(c: CategoriaContexto): string {
  if (c === "cpf") return "Capivara analisando documento CPF com lupa";
  if (c === "cnpj") return "Capivara analisando contrato CNPJ ao lado de prédio comercial";
  return "Capivara analisando placa de veículo com lupa";
}
