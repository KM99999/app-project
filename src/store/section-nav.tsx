/**
 * Navegación por secciones — Forno
 *
 * La barra lateral vive en el layout, que es el **padre** de la pantalla de Inicio, así
 * que no puede tocar su ScrollView directamente. Este contexto es el canal entre ambos:
 * la barra pide "llevame a Todo el menú" y la pantalla, que sí tiene el ref del scroll,
 * obedece.
 *
 * El pedido lleva un `nonce` incremental y no solo el nombre de la sección: sin él, tocar
 * dos veces seguidas el mismo ítem no cambiaría el estado y el segundo toque no haría
 * nada — que es justo lo que el usuario espera que funcione cuando ya bajó con la rueda.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

export type SectionId = 'populares' | 'menu';

type ScrollRequest = { section: SectionId; nonce: number };

type SectionNavValue = {
  /** Último pedido de desplazamiento. `null` si todavía no hubo ninguno. */
  request: ScrollRequest | null;
  /** Sección visible, para resaltar el ítem correspondiente en la barra lateral. */
  active: SectionId | null;
  goToSection: (section: SectionId) => void;
  setActive: (section: SectionId | null) => void;
};

const SectionNavContext = createContext<SectionNavValue | null>(null);

export function SectionNavProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ScrollRequest | null>(null);
  const [active, setActive] = useState<SectionId | null>(null);

  const goToSection = (section: SectionId) => {
    setRequest((current) => ({ section, nonce: (current?.nonce ?? 0) + 1 }));
    setActive(section);
  };

  return (
    <SectionNavContext.Provider value={{ request, active, goToSection, setActive }}>
      {children}
    </SectionNavContext.Provider>
  );
}

export function useSectionNav(): SectionNavValue {
  const context = useContext(SectionNavContext);
  if (!context) throw new Error('useSectionNav debe usarse dentro de <SectionNavProvider>');
  return context;
}
