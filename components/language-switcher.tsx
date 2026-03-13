/**
 * Componente selector de idioma usando next-intl nativo
 * 
 * Este componente demuestra cómo usar useLocale() para crear
 * un selector de idioma funcional.
 */

"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  // const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Remover el locale actual del pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    
    // Construir la nueva URL con el nuevo locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Navegar a la nueva URL
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      
      <Button
        variant={locale === 'es' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('es')}
        className="min-w-[60px]"
      >
        ES
      </Button>
      
      <Button
        variant={locale === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
        className="min-w-[60px]"
      >
        EN
      </Button>
    </div>
  );
}

/**
 * Versión alternativa con dropdown
 */
export function LanguageDropdown() {
  const locale = useLocale();
  // const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    // Remover el locale actual del pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    
    // Construir la nueva URL con el nuevo locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Navegar a la nueva URL
    router.push(newPath);
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="outline"
        className="flex items-center gap-2"
      >
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
      </Button>
      
      <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right">
        <div className="rounded-md border border-border/70 bg-popover py-1 text-popover-foreground shadow-[0_18px_50px_-28px_oklch(var(--primary)/0.24)]">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`${
                locale === language.code
                  ? 'bg-primary/12 text-primary'
                  : 'text-foreground hover:bg-primary/8'
              } flex items-center w-full px-4 py-2 text-sm`}
            >
              <span className="mr-3">{language.flag}</span>
              {language.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
