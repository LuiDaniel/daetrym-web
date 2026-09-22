import { useTranslations } from 'next-intl';
import { footerNav } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { socialLinks } from '@/config/social';
import { Link } from '@/i18n/navigation';
import { Logo } from './logo';

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-hairline bg-band">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-small text-fg-muted">{t('footer.tagline')}</p>
        </div>

        {footerNav.map((group) => (
          <nav key={group.titleKey} aria-labelledby={`footer-${group.titleKey}`}>
            <h2 id={`footer-${group.titleKey}`} className="text-eyebrow text-fg-subtle">
              {t(`footer.${group.titleKey}`)}
            </h2>
            <ul className="mt-3.5 flex flex-col gap-2">
              {group.items.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-small text-fg-muted hover:text-fg">
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container-page flex flex-col gap-4 border-t border-hairline py-6 text-small text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>{t('footer.copyright', { year, name: siteConfig.legalName })}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-fg">
            {siteConfig.contact.email}
          </a>
          {socialLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
