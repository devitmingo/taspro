import Link from "next/link";
import { Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: Props) {
  return (
    <div className="hidden md:block md:border-b md:border-[#E1E1E1] md:pb-3 md:mb-5">
      <div className="flex items-center gap-2 text-xs text-gray-400 pb-2">
        <Home size={14} className="text-[#C1C1C1]" />

        <div className="flex items-center gap-2 flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <div key={index} className="flex items-center gap-2">
                {isLast ? (
                  <span className="text-orange-500 font-medium">
                    {item.label}
                  </span>
                ) : item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="hover:text-orange-500 transition cursor-pointer text-gray-500"
                  >
                    {item.label}
                  </button>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-gray-600 transition text-gray-500"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-500">{item.label}</span>
                )}

                {!isLast && <span className="text-gray-300">|</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
