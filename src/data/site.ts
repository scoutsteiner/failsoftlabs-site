export const site = { name: 'Fail Soft Labs', tagline: 'Daemon Slaying, Kernel Wrangling, Terminal Mischief', contact: 'support@failsoftlabs.com' };
export const navigation = ['Home', 'Lab', 'Life', 'Advocacy', 'Links'].map(label => ({label, href: label === 'Home' ? '/' : `/${label.toLowerCase()}/`}));
export const socials = [
  {name: 'Facebook · Just Fix It Beth', href: 'https://www.facebook.com/people/Just-Fix-It-Beth/61593414016237/'},
  {name: 'GitHub', href: 'https://github.com/scoutsteiner'},
  {name: 'LinkedIn', href: 'https://www.linkedin.com/in/elizabeth-steinmetz-884468277'},
  {name: 'Instagram', href: 'https://www.instagram.com/scout.steiner/'},
];
