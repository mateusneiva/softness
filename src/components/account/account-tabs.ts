export type AccountTab = 'overview' | 'profile' | 'orders' | 'addresses' | 'payment' | 'security';

export const ACCOUNT_TAB_HREFS: Record<AccountTab, string> = {
  overview: '/account',
  profile: '/account/profile',
  orders: '/account/orders',
  addresses: '/account/addresses',
  payment: '/account/payment',
  security: '/account/security',
};

export function resolveAccountTab(pathname: string): AccountTab {
  if (pathname.startsWith('/account/profile')) return 'profile';
  if (pathname.startsWith('/account/orders')) return 'orders';
  if (pathname.startsWith('/account/addresses')) return 'addresses';
  if (pathname.startsWith('/account/payment')) return 'payment';
  if (pathname.startsWith('/account/security')) return 'security';
  return 'overview';
}
