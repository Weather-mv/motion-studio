import React, {createContext, useContext} from 'react';
import type {Brand} from './types';

type Ctx = {brand: Brand; jobId: string};
const ThemeCtx = createContext<Ctx | null>(null);

export const ThemeProvider: React.FC<React.PropsWithChildren<Ctx>> = ({brand, jobId, children}) => (
  <ThemeCtx.Provider value={{brand, jobId}}>{children}</ThemeCtx.Provider>
);

export const useTheme = (): Ctx => {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error('useTheme must be used inside ThemeProvider');
  return c;
};
