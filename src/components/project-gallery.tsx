import Image from "next/image";
import { Box } from "lucide-react";
import { projects } from "@/config/portfolio";
import { ReferenceImage } from "./reference-image";
export function ProjectGallery() {
  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <article className="project" key={project.title}>
          {project.crop ? (
            <div className="project-photo-window">
              <ReferenceImage crop={project.crop} alt={project.alt} />
            </div>
          ) : project.image ? (
            <div className="project-placeholder project-photo">
              <Image
                src={project.image}
                alt={project.alt}
                fill
                sizes="(max-width: 700px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <div className="project-placeholder">
              <Box size={58} strokeWidth={0.7} />
              <span>PROJECT IMAGE / {String(index + 1).padStart(2, "0")}</span>
            </div>
          )}
          <div className="project-meta">
            <h3>{project.title}</h3>
            <span className="tag">{project.material}</span>
          </div>
          <p>{project.description}</p>
          {project.sample && (
            <small>Sample application · image placeholder</small>
          )}
        </article>
      ))}
    </div>
  );
}
