import { business } from "@/config/business";
import { ReferenceImage } from "./reference-image";
export function Brand() {
  return (
    <>
      <ReferenceImage
        crop={{ x: 219, y: 11, width: 138, height: 184 }}
        alt=""
        className="brand-mark"
        priority
      />
      <span>
        {business.name}
        <small>{business.descriptor}</small>
      </span>
    </>
  );
}
