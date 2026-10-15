import type { StoredFile, PrintRequest, CustomDesignRequest } from "../models";
// Replace this adapter with PRIVATE Supabase Storage + short-lived signed links for larger files.
// Default files are sent as attachments; there is no misleading ephemeral filesystem persistence.
export interface FileStorage {
  prepare(file: File): Promise<StoredFile>;
}
export const storage: FileStorage = {
  async prepare(file) {
    return {
      name: file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120),
      contentType: "application/octet-stream",
      bytes: new Uint8Array(await file.arrayBuffer()),
    };
  },
};
// Implement this interface when adding a durable database. Email is the current request record.
export interface RequestRepository {
  save(request: PrintRequest | CustomDesignRequest): Promise<void>;
  find(id: string): Promise<PrintRequest | CustomDesignRequest | null>;
}
