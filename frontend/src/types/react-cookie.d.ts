declare module 'react-cookie' {
  export interface CookieSetOptions {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }

  export interface Cookies {
    [key: string]: string;
  }

  export interface UseCookies {
    [key: string]: string;
    setCookie: (name: string, value: string, options?: CookieSetOptions) => void;
    removeCookie: (name: string, options?: CookieSetOptions) => void;
  }

  export function useCookies(dependencies?: string[]): [Cookies, (name: string, value: string, options?: CookieSetOptions) => void, (name: string, options?: CookieSetOptions) => void];

  export interface CookiesProviderProps {
    children: React.ReactNode;
  }

  export const CookiesProvider: React.FC<CookiesProviderProps>;
} 