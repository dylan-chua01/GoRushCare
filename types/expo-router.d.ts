import 'expo-router';

type Routes = '/' | '/auth' | '/home';

declare module 'expo-router' {
  export interface Link {
    href: Routes;
  }
  export function useRouter(): {
    push: (route: Routes) => void;
    replace: (route: Routes) => void;
    back: () => void;
  };
}