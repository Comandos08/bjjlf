import { type ReactNode } from "react";
import dragon from "@/assets/dragon-logo.png";
import { Link } from "@tanstack/react-router";

export function AthleteAuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-md mx-auto">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <img src={dragon} alt="BJJLF" className="h-9 w-9 object-contain" />
          <span
            className="text-2xl text-[#C8211A]"
            style={{ fontFamily: "Bebas Neue, Barlow Condensed, sans-serif", letterSpacing: "3px" }}
          >
            BJJLF
          </span>
        </Link>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 pt-7 pb-5 text-center border-b border-gray-100">
            <h1
              className="text-2xl uppercase text-gray-900 tracking-wide"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="mt-2 text-sm text-gray-500"
                style={{ fontFamily: "Barlow", fontWeight: 400 }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className="px-6 py-6">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-gray-100 text-center text-sm text-gray-500">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Common Tailwind class strings used by the form fields. */
export const fieldStyles = {
  label:
    "block text-xs uppercase tracking-wider text-gray-500 mb-1.5",
  input:
    "w-full h-11 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C8211A] focus:ring-1 focus:ring-[#C8211A]",
  select:
    "w-full h-11 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#C8211A] focus:ring-1 focus:ring-[#C8211A]",
  error: "block text-xs text-[#C8211A] mt-1",
  primaryBtn:
    "w-full h-11 bg-[#C8211A] hover:bg-[#8B1612] text-white text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-colors",
};

export const labelStyle = { fontFamily: "Barlow", fontWeight: 500 } as const;
export const btnStyle = { fontFamily: "Barlow Condensed", fontWeight: 700 } as const;
