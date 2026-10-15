export type Project = {
  title: string;
  material: string;
  description: string;
  image: string | null;
  alt: string;
  sample: boolean;
  crop?: { x: number; y: number; width: number; height: number };
};
// Put photos in public/projects, then set image to /projects/your-photo.jpg and sample to false.
export const projects: Project[] = [
  {
    title: "Custom fender tags",
    material: "Custom 3D printing",
    description:
      "Small details brought into physical form for classic car projects.",
    image: "/brand/additive-3d-reference.png",
    alt: "A 3D printed fender tag with raised lettering on the workbench",
    sample: false,
    crop: { x: 1, y: 470, width: 299, height: 165 },
  },
  {
    title: "Small-batch components",
    material: "Batch manufacturing",
    description:
      "A full build plate of repeated components, prepared for a customer project.",
    image: "/brand/additive-3d-reference.png",
    alt: "White ring-shaped components arranged on a 3D printer build plate",
    sample: false,
    crop: { x: 562, y: 319, width: 230, height: 240 },
  },
  {
    title: "On the build plate",
    material: "FDM 3D printing",
    description:
      "From digital preparation to finished geometry, one layer at a time.",
    image: "/brand/additive-3d-reference.png",
    alt: "A Bambu Lab printer manufacturing dark parts on a textured build plate",
    sample: false,
    crop: { x: 794, y: 223, width: 230, height: 413 },
  },
];
