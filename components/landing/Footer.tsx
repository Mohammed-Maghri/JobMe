import Link from "next/link";
import PixelPlane from "./PixelPlane";
import { FOOTER_COLUMNS } from "./content";
import { CONTAINER } from "./layout";

const YEAR = new Date().getFullYear();

const linkClass =
  "inline-flex min-h-11 items-center rounded-[4px] text-[0.9375rem] text-espresso/70 transition-colors hover:text-plum";

export default function Footer() {
  return (
    <footer className="bg-stone">
      <div className={`${CONTAINER} py-12 lg:py-14`}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] lg:gap-12">
          <div className="max-w-[22rem]">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 rounded-[4px] font-display text-[1.375rem] font-bold tracking-[-0.03em] text-espresso"
            >
              <PixelPlane size={28} />
              ApplyPilot
            </Link>
            <p className="mt-3 text-[0.9375rem] leading-[1.6] text-espresso/65">
              Discover jobs, internships and alternance opportunities, then keep
              every application moving forward in one calm workspace.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="font-display text-[0.75rem] font-bold tracking-[0.16em] text-espresso/55 uppercase">
                {column.heading}
              </h2>
              <ul className="mt-2 flex flex-col">
                {column.links.map((link) =>
                  link.href.startsWith("/") ? (
                    <li key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-3 border-t-2 border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-[0.8125rem] text-espresso/55">
            © {YEAR} ApplyPilot. All rights reserved.
          </p>
          <Link
            href="/signin"
            className="inline-flex min-h-11 items-center rounded-[4px] font-display text-[0.9375rem] font-bold text-plum"
          >
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
