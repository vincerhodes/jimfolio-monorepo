import Link from "next/link";

const Logo = () => (
  <span className="logo-placeholder" aria-hidden="true">
    <svg viewBox="0 0 64 64" role="img" aria-label="Power BI logo placeholder">
      <rect x="7" y="32" width="10" height="23" rx="2" fill="#F2C811" />
      <rect x="23" y="24" width="10" height="31" rx="2" fill="#F2C811" />
      <rect x="39" y="15" width="10" height="40" rx="2" fill="#F2C811" />
      <circle cx="53" cy="12" r="4" fill="#F2C811" />
    </svg>
  </span>
);

export default function Header({
  title,
  subtitle,
  activePage,
}: {
  title: string;
  subtitle: string;
  activePage: "overview" | "session1" | "session2" | "data-explorer";
}) {
  const links = [
    { href: "/course", label: "Overview", id: "overview" },
    { href: "/course/session1", label: "Session 1", id: "session1" },
    { href: "/course/session2", label: "Session 2", id: "session2" },
    { href: "/course/data-explorer", label: "Data Explorer", id: "data-explorer" },
  ];

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/course" aria-label="Power BI course home">
          <Logo />
          <span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </span>
        </Link>
        <nav className="top-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.id}
              className={activePage === link.id ? "active" : ""}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
