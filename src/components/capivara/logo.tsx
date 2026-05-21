import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "horizontal" | "wordmark";
  size?: number;
  className?: string;
}

/**
 * Logo Capivara · use 'horizontal' como default em headers/landings.
 */
export function Logo({
  variant = "horizontal",
  size = 32,
  className,
}: LogoProps) {
  const src = variant === "horizontal"
    ? "/brand/logo/horizontal.svg"
    : "/brand/logo/variante-1.svg";

  // Logos horizontais sao mais largas que altas — proporcao aproximada 4:1
  const width = variant === "horizontal" ? size * 4 : size;

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={src}
        alt="Capivara"
        width={width}
        height={size}
        priority
      />
    </span>
  );
}
