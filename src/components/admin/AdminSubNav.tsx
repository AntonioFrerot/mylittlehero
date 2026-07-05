"use client";

type AdminSubNavItem<T extends string> = {
  id: T;
  label: string;
  badge?: number;
};

type AdminSubNavProps<T extends string> = {
  items: AdminSubNavItem<T>[];
  active: T;
  onSelect: (id: T) => void;
  ariaLabel: string;
};

export function AdminSubNav<T extends string>({
  items,
  active,
  onSelect,
  ariaLabel,
}: AdminSubNavProps<T>) {
  return (
    <nav
      className="admin-sub-nav"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`admin-sub-nav__item${isActive ? " admin-sub-nav__item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span>{item.label}</span>
            {typeof item.badge === "number" && item.badge > 0 ? (
              <span className="admin-sub-nav__badge">{item.badge}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
