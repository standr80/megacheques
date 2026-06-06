export type Size = {
  name: 'Mini' | 'Maxi' | 'Mega';
  dimensions: string;
  singleUsePrice: number;
  reusablePrice: number;
};

export const sizes: Size[] = [
  { name: 'Mini', dimensions: '100cm x 50cm', singleUsePrice: 59.95, reusablePrice: 79.95 },
  { name: 'Maxi', dimensions: '150cm x 75cm', singleUsePrice: 109.95, reusablePrice: 129.95 },
  { name: 'Mega', dimensions: '200cm x 100cm', singleUsePrice: 179.95, reusablePrice: 199.95 },
];

export type Product = {
  slug: string;
  name: string;
  type: 'single-use' | 'reusable';
  tagline: string;
  description: string;
  material: string;
  bestFor: string;
};

export const products: Product[] = [
  {
    slug: 'single-use-cheque',
    name: 'Single Use Cheque',
    type: 'single-use',
    tagline: 'A bold one-off statement piece for your big presentation moment.',
    description:
      'Our single use oversized novelty cheque is perfect for presentations for your company or organisation. Fully branded with your colours and logo by our in-house design team, it is a great way to get your message across for promotion and PR for the charity you are supporting.',
    material:
      'Printed onto a 3mm sturdy PVC board with a high quality laminated matt finish. Best suited to one-off presentations where quality counts, such as high profile award evenings and corporate fundraising events.',
    bestFor: 'One-off presentations, award evenings, corporate fundraising events',
  },
  {
    slug: 'reusable-cheque',
    name: 'Reusable Cheque',
    type: 'reusable',
    tagline: 'A practical dry-wipe cheque that keeps on giving, presentation after presentation.',
    description:
      'The reusable cheque is a dry wipe version of the single jumbo cheque that works perfectly for those who fundraise regularly. Printed with your logo, website address and any message in a practical dry wipe covering, so the cheque can be presented time and time again.',
    material:
      'Printed onto a 3mm sturdy PVC board with a dry wipe laminated coating. Lightweight, durable and long lasting — the surface can be cleaned and reused over and over again.',
    bestFor: 'Regular fundraising activities, charities and community groups',
  },
];

export const company = {
  name: 'Mega Cheques',
  legalName: 'Event Stuff Ltd',
  phone: '01842 337 100',
  phoneHref: 'tel:01842337100',
  email: 'office@eventstuff.ltd',
  address: 'Unit 11 Napier Place, Stephenson Way Industrial Estate, Thetford, IP24 3RL',
};
