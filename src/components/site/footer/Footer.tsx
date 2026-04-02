import FooterColumn from "@/components/site/footer/FooterColumn";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default function Footer({ locale = "en" }: { locale?: Locale }) {
  const m = getMessages(locale);

  return (
    <footer className="mt-16 w-full bg-foreground text-background">
      <div
        className="relative flex min-h-[50vh] items-center justify-center bg-foreground bg-none bg-contain bg-center md:bg-[url('/images/footer_bg.png')]"
      >
        <div className="absolute inset-0 bg-foreground/30 md:bg-black/20" aria-hidden="true" />

        <div className="relative container w-full px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn title={m.footer.quickLinks}>
              <ul className="space-y-2">
                <li>{m.footer.items.home}</li>
                <li>{m.footer.items.shop}</li>
                <li>{m.footer.items.boxes}</li>
                <li>{m.footer.items.farmers}</li>
                <li>{m.footer.items.about}</li>
                <li>{m.footer.items.contact}</li>
              </ul>
            </FooterColumn>

            <FooterColumn title={m.footer.services}>
              <ul className="space-y-2">
                <li>{m.footer.items.fresh}</li>
                <li>{m.footer.items.subs}</li>
                <li>{m.footer.items.delivery}</li>
                <li>{m.footer.items.organic}</li>
              </ul>
            </FooterColumn>

            <FooterColumn title={m.footer.contact}>
              <ul className="space-y-2">
                <li>Yangon, Myanmar.</li>
                <li>+95 9 123 456 789</li>
                <li>hello.freshroot.com</li>
              </ul>
            </FooterColumn>

            <FooterColumn title={m.footer.legal}>
              <ul className="space-y-2">
                <li>{m.footer.items.privacy}</li>
                <li>{m.footer.items.terms}</li>
                <li>{m.footer.items.cookie}</li>
              </ul>
            </FooterColumn>
          </div>

          <div className="mt-10 text-center text-xs text-background/70">
            {m.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}

