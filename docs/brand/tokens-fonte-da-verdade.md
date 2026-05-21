# Bloco 0

```
/* tokens.css — fonte da verdade */
:root {
  /* cor */
  --cocoa:    #1F1611;
  --cocoa-2:  #2C211A;
  --fur:      #C46A3F;  /* brand */
  --tabaco:   #8E4628;
  --saffron:  #E8A547;  /* accent / CTA */
  --sage:     #8B9778;
  --cream:    #F4EAD8;
  --paper:    #FBF6EC;
  --paper-2:  #FFFCF5;
  --line:     #E6D8BD;

  /* semântica */
  --ok:       #5E7C4F;
  --err:      #B23A2A;
  --warn:     #D78A1E;
  --info:     #527090;

  /* tipo */
  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --font-body:    "Manrope", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  /* radius */
  --radius-xs: 4px;  --radius-sm: 8px;
  --radius-md: 12px; --radius-lg: 16px;
  --radius-xl: 24px; --radius-2xl: 32px;

  /* sombras */
  --shadow-sm: 0 1px 2px rgba(31,22,17,0.06);
  --shadow-md: 0 4px 12px rgba(31,22,17,0.08);
  --shadow-lg: 0 12px 32px rgba(31,22,17,0.12);
  --shadow-xl: 0 24px 56px rgba(31,22,17,0.16);
}

.dark {
  --cocoa:    #F4EAD8;  /* texto vira creme */
  --paper:    #14100C;  /* canvas vira void */
  --paper-2:  #1F1812;
  --cream:    #2A201A;
  --line:     #3A2C22;
  --fur:      #D88456;  /* brighter pra contraste */
}
```

---

# Bloco 1

```
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* cor — todas viram utilities bg-*, text-*, border-* */
  --color-cocoa:    #1F1611;
  --color-fur:      #C46A3F;
  --color-tabaco:   #8E4628;
  --color-saffron:  #E8A547;
  --color-sage:     #8B9778;
  --color-cream:    #F4EAD8;
  --color-paper:    #FBF6EC;
  --color-line:     #E6D8BD;
  --color-ok:       #5E7C4F;
  --color-err:      #B23A2A;
  --color-warn:     #D78A1E;
  --color-info:     #527090;

  /* fontes */
  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --font-sans:    "Manrope", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", monospace;

  /* sombras customizadas */
  --shadow-card: 0 4px 12px rgba(31,22,17,0.08);
  --shadow-pop:  0 12px 32px rgba(31,22,17,0.12);

  /* easing comum */
  --ease-cap: cubic-bezier(.2, .7, .3, 1);
}
```

---

# Bloco 2

```
/* mapeia variáveis Capivara nos slots do shadcn */
@layer base {
  :root {
    --background:          var(--paper);
    --foreground:          var(--cocoa);
    --card:                var(--paper-2);
    --card-foreground:     var(--cocoa);
    --primary:             var(--cocoa);
    --primary-foreground:  var(--cream);
    --accent:              var(--saffron);
    --accent-foreground:   var(--cocoa);
    --muted:               var(--cream);
    --muted-foreground:    var(--tabaco);
    --border:              var(--line);
    --ring:                var(--fur);
    --destructive:         var(--err);
  }
}
```

---

# Bloco 3

```
// components/ui/button.tsx — variantes da Capivara
const buttonVariants = cva("…base classes…", {
  variants: {
    variant: {
      primary:     "bg-cocoa text-cream hover:bg-cocoa-3",
      accent:      "bg-saffron text-cocoa hover:brightness-95",
      secondary:   "bg-cream text-cocoa border border-line hover:bg-paper",
      ghost:       "bg-transparent hover:bg-cream",
      destructive: "bg-err text-cream hover:brightness-90",
    },
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
```
