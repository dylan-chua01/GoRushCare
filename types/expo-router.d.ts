import 'expo-router';

type Routes = '/' | '/auth' | '/home';

declare module 'expo-router' {
  export interface Link {
    href: Routes;
  }
  export function useRouter(): {
    addListener(arg0: string, arg1: () => void): unknown;
    params: {};
    push: (route: Routes) => void;
    replace: (route: Routes) => void;
    back: () => void;
  };
}