'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Country, State } from 'country-state-city';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  MapPin,
  Package,
  ShieldAlert,
  ShoppingBag,
  User,
} from 'lucide-react';
import { OrderStatusBadge } from '@/src/components/shared/order-status-badge';
import { ButtonLink } from '@/src/components/ui/button';
import { getAssetUrl } from '@/src/services/api';
import { formatPrice } from '@/src/utils/format/currency';
import type { AccountOverviewResponse, OrderStatus } from '@/src/types';

interface AccountOverviewProps {
  overview: AccountOverviewResponse | null;
  loading: boolean;
}

function formatJoinedDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function countryName(code: string) {
  return Country.getCountryByCode(code)?.name ?? code;
}

function stateName(country: string, code: string) {
  return State.getStateByCodeAndCountry(code, country)?.name ?? code;
}

const shortcuts = [
  {
    href: '/account/profile',
    label: 'Profile',
    icon: User,
    description: 'Personal details',
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    href: '/account/security',
    label: 'Security',
    icon: LockKeyhole,
    description: 'Password & sign-in',
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    href: '/account/addresses',
    label: 'Addresses',
    icon: MapPin,
    description: 'Shipping locations',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    href: '/account/payment',
    label: 'Payment',
    icon: CreditCard,
    description: 'Cards & billing',
    tone: 'bg-sky-50 text-sky-700',
  },
] as const;

export function AccountOverview({ overview, loading }: AccountOverviewProps) {
  if (loading || !overview) {
    return (
      <section>
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Overview</p>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">Account Summary</h2>
        </div>
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-neutral-900" size={28} />
        </div>
      </section>
    );
  }

  const { user, stats } = overview;
  const displayName = user.name?.trim() || 'there';
  const emailVerified = user.emailVerified !== false;
  const securityOk = emailVerified && Boolean(user.hasPassword || user.googleLinked);
  const latestOrder = stats.latestOrder;
  const orderStatus = (latestOrder?.status ?? 'PENDING') as OrderStatus;

  return (
    <section>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Overview</p>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-950">Welcome back, {displayName}</h2>
        <p className="text-sm text-neutral-500 mt-2">
          Member since {formatJoinedDate(user.createdAt)}. Here&apos;s what&apos;s happening on your account.
        </p>
      </div>

      <div className="mb-6 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-sky-50 text-sky-700">
              <Package size={18} />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">Orders</p>
              <p className="text-2xl font-black tracking-tight text-neutral-950">
                {stats.ordersCount}{' '}
                <span className="text-sm font-normal text-neutral-400">
                  {stats.ordersCount === 1 ? 'order' : 'orders'} total
                </span>
              </p>
            </div>
          </div>
          <ButtonLink href="/account/orders" variant="outline" size="sm">
            View all orders
            <ArrowRight size={12} />
          </ButtonLink>
        </div>

        {latestOrder ? (
          <div className="px-5 py-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Latest order</p>
                <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                  #{latestOrder.id.slice(0, 8)}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  {formatOrderDate(latestOrder.createdAt)}
                  {latestOrder.trackingNumber ? ` · Tracking ${latestOrder.trackingNumber}` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <OrderStatusBadge status={orderStatus} />
                <p className="font-mono text-lg font-bold text-neutral-950">{formatPrice(latestOrder.total)}</p>
              </div>
            </div>

            {latestOrder.items.length > 0 && (
              <ul className="mb-5 divide-y divide-neutral-100 border border-neutral-100">
                {latestOrder.items.map((item, index) => (
                  <li key={`${item.productName}-${index}`} className="flex items-center gap-3 px-3 py-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-neutral-100">
                      {item.imageUrl ? (
                        <Image src={getAssetUrl(item.imageUrl)} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-neutral-400">
                          <ShoppingBag size={14} />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold uppercase tracking-wider text-neutral-950">
                        {item.productName}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        {item.variantName ? `${item.variantName} · ` : ''}Qty {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={`/account/orders/${latestOrder.id}`}
              className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              Open order detail <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 px-5 py-8">
            <span className="flex h-12 w-12 items-center justify-center bg-sky-50 text-sky-600">
              <ShoppingBag size={20} />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">No orders yet</p>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                When you place your first Softness order, it will show up here with tracking and status.
              </p>
            </div>
            <ButtonLink href="/" variant="outline" size="sm">
              Start shopping
              <ArrowRight size={12} />
            </ButtonLink>
          </div>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <MapPin size={15} />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Default address</p>
            </div>
            <Link
              href="/account/addresses"
              className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-neutral-400 hover:text-black"
            >
              Manage <ArrowRight size={11} />
            </Link>
          </div>
          {stats.defaultAddress ? (
            <>
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                {stats.defaultAddress.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                {stats.defaultAddress.street}
                <br />
                {stats.defaultAddress.city}, {stateName(stats.defaultAddress.country, stats.defaultAddress.state)}{' '}
                {stats.defaultAddress.zipCode}
                <br />
                {countryName(stats.defaultAddress.country)}
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-500">No address saved yet.</p>
          )}
        </div>

        <div className="bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-violet-700">
              <LockKeyhole size={15} />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Security</p>
            </div>
            <Link
              href="/account/security"
              className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-neutral-400 hover:text-black"
            >
              Review <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex items-start gap-2">
            {securityOk ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            ) : (
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                {securityOk ? 'Looking good' : 'Needs attention'}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {[
                  emailVerified ? 'Email verified' : 'Email not verified',
                  user.hasPassword ? 'Password set' : 'No password',
                  user.googleLinked ? 'Google connected' : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-3">Quick links</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shortcuts.map(({ href, label, icon: Icon, description, tone }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.07)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(0,0,0,0.12)]"
            >
              <span className={`flex h-9 w-9 items-center justify-center ${tone}`}>
                <Icon size={16} />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-widest text-neutral-950">{label}</span>
                <span className="mt-0.5 block text-[11px] text-neutral-500">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
