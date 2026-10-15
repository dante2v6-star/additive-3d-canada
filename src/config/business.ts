// Replace placeholders before launch. Only publish confirmed business details.
export const business = {
  name: "Additive 3D",
  descriptor: "ADDITIVE MANUFACTURING",
  city: "London, Ontario",
  address: "1235 Richmond St",
  postalAddress: "1235 Richmond St, London, Ontario, Canada",
  email: "addititive3dcanada@gmail.com",
  phone: "905-746-4910",
  hours: "Every day · 10:00 a.m.–11:00 p.m. (Eastern Time)",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};
export const navigation = [
  ["Home", "/"],
  ["Instant Quote", "/#quote"],
  ["Services", "/#services"],
  ["Custom Design", "/custom-design"],
  ["Our Process", "/#process"],
  ["FAQ", "/#faq"],
  ["Contact", "/#contact"],
] as const;
