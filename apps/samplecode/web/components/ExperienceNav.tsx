import Link from "next/link";

const links = [
  { href: "/supplier-overview", label: "1. Supplier Overview" },
  { href: "/risk-workbench", label: "2. Risk Workbench" },
  { href: "/qualification-checklist", label: "3. Qualification Checklist" },
  { href: "/onboarding-timeline", label: "4. Onboarding Timeline" }
];

export function ExperienceNav() {
  return (
    <nav className="experience-nav" aria-label="Experience navigation">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="pill-link">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
