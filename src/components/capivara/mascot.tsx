import Image from "next/image";
import { cn } from "@/lib/utils";

export type MascotPose =
  | "padrao"
  | "investigando"
  | "concluido"
  | "atencao"
  | "heroico";

export interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  /** Aplica animacao idle (bob 2s) ou investigating (rotate 1.2s). */
  animate?: "idle" | "investigando" | false;
  /** Texto alternativo customizado. */
  alt?: string;
  priority?: boolean;
}

const POSE_LABELS: Record<MascotPose, string> = {
  padrao: "Capivara da Capivara",
  investigando: "Capivara investigando com lupa",
  concluido: "Capivara concluiu a consulta",
  atencao: "Capivara em alerta",
  heroico: "Capivara em pose heroica",
};

/**
 * Mascote oficial Capivara · brandbook Cerrado v1.0.
 *
 * Exemplo:
 *   <Mascot pose="investigando" animate="investigando" size={120} />
 */
export function Mascot({
  pose = "padrao",
  size = 96,
  className,
  animate = "idle",
  alt,
  priority = false,
}: MascotProps) {
  const animClass =
    animate === "idle"
      ? "capivara-idle"
      : animate === "investigando"
      ? "capivara-investigando"
      : "";

  return (
    <span className={cn("inline-block", animClass, className)}>
      <Image
        src={`/brand/mascot/${pose}.svg`}
        alt={alt ?? POSE_LABELS[pose]}
        width={size}
        height={size}
        priority={priority}
      />
    </span>
  );
}
