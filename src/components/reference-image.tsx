import Image from "next/image";
export type ReferenceCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};
// Present a region of the supplied reference; the original bitmap is preserved.
export function ReferenceImage({
  crop,
  alt,
  className = "",
  priority = false,
}: {
  crop: ReferenceCrop;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`reference-crop ${className}`}
      style={{ aspectRatio: `${crop.width}/${crop.height}` }}
    >
      <Image
        src="/brand/additive-3d-reference.png"
        alt={alt}
        fill
        priority={priority}
        sizes="1039px"
        style={{
          width: `${(1039 / crop.width) * 100}%`,
          height: "auto",
          left: `${(-crop.x / crop.width) * 100}%`,
          top: `${(-crop.y / crop.height) * 100}%`,
          maxWidth: "none",
        }}
      />
    </div>
  );
}
