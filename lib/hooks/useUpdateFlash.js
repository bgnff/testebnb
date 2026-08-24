import { useState, useRef, useCallback } from 'react';

/**
 * Hook para mostrar flash effect quando um item é atualizado por outro usuário
 * Útil para indicar visualmente que uma linha/card foi atualizado em tempo real
 */
export function useUpdateFlash() {
  const [flashingIds, setFlashingIds] = useState(new Set());
  const timeoutRef = useRef(null);

  const flash = useCallback((id) => {
    setFlashingIds((prev) => new Set([...prev, id]));
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setFlashingIds(new Set());
    }, 1000); // Flash por 1 segundo
  }, []);

  const isFlashing = useCallback((id) => {
    return flashingIds.has(id);
  }, [flashingIds]);

  return { flash, isFlashing };
}
