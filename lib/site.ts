export const SITE = {
  name: "Unit Calculator",
  title: "Nigeria Electricity Unit Calculator",
  description:
    "Convert naira to electricity units for your state and band. Free, instant, and works offline.",
  url: "https://unit-calculator.ng",
  locale: "en_NG",
  author: {
    name: "Mubarak (codeswot)",
    url: "https://codeswot.me",
  },
  repo: "https://github.com/codeswot/unit-calculator",
} as const;

export const REPORT_RATE_URL = `${SITE.repo}/issues/new?labels=rate-report&title=Wrong+rate&body=State%3A+%0ABand%3A+%0AWhat+is+wrong%3A+`;
