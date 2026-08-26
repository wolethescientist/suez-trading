"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  Tag,
  Ticket,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { logoutAction } from "@/app/admin/actions/auth";
import { can } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Nav = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  ownerOnly?: boolean;
};

export function Sidebar({
  user,
  counts,
}: {
  user: { name: string; email: string; role: string };
  counts: { pendingOrders: number; lowStock: number; newEnquiries: number };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const groups: { title: string; items: Nav[] }[] = [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Selling",
      items: [
        { href: "/admin/orders", label: "Orders", icon: ListOrdered, badge: counts.pendingOrders },
        { href: "/admin/enquiries", label: "Enquiries", icon: Mail, badge: counts.newEnquiries },
      ],
    },
    {
      title: "Catalogue",
      items: [
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/inventory", label: "Inventory", icon: Warehouse, badge: counts.lowStock },
        { href: "/admin/categories", label: "Categories", icon: Tag },
        { href: "/admin/coupons", label: "Discount codes", icon: Ticket },
      ],
    },
    {
      title: "Store",
      items: [
        { href: "/admin/settings", label: "Settings", icon: Settings },
        { href: "/admin/staff", label: "Staff", icon: Users, ownerOnly: true },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle admin menu"
        className="fixed left-4 top-4 z-80 grid h-10 w-10 place-items-center rounded-sm bg-ink text-white lg:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-70 bg-ink/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-75 flex w-64 flex-col border-r border-white/[0.07] bg-ink transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/[0.07] px-5 py-5 pl-16 lg:pl-5">
          <Logo tone="light" />
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => {
            const items = group.items.filter(
              (item) => !item.ownerOnly || can(user.role, "manageStaff"),
            );
            if (items.length === 0) return null;

            return (
              <div key={group.title}>
                <p className="px-3 font-display text-[0.625rem] font-bold uppercase tracking-[0.18em] text-fg-bone-muted/70">
                  {group.title}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-sm px-3 py-2.5 font-display text-[0.8125rem] font-semibold transition-colors",
                          isActive(item.href)
                            ? "bg-white/[0.08] text-white"
                            : "text-fg-bone-muted hover:bg-white/[0.04] hover:text-white",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 flex-none",
                            isActive(item.href) ? "text-cargo" : "text-fg-bone-muted",
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge ? (
                          <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-cargo px-1.5 text-[0.625rem] font-extrabold text-ink">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.07] p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[0.8125rem] font-semibold text-fg-bone-muted transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <ExternalLink className="h-4 w-4 text-fg-bone-muted" />
            View storefront
          </Link>

          <div className="mt-2 rounded-sm bg-white/[0.04] p-3">
            <p className="truncate font-display text-[0.8125rem] font-bold text-white">
              {user.name}
            </p>
            <p className="truncate text-[0.6875rem] text-fg-bone-muted">{user.email}</p>
            <span className="mt-2 inline-block rounded-[2px] bg-cargo/15 px-1.5 py-0.5 font-display text-[0.625rem] font-bold uppercase tracking-wider text-cargo">
              {user.role}
            </span>

            <form action={logoutAction} className="mt-3">
              <button
                type="submit"
                className="flex w-full items-center gap-2 text-[0.75rem] font-semibold text-fg-bone-muted transition-colors hover:text-alert"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
