import Link from "next/link";
import { legal } from "@/config/legal";
export function RequestConsent() {
  return (
    <>
      <input type="hidden" name="policyVersion" value={legal.version} />
      <label className="checkbox">
        <input type="checkbox" name="privacyConsent" value="true" required />
        <span>
          I consent to Additive 3D using my contact details, project information
          and files to review and respond to this request as described in the{" "}
          <Link href="/privacy" target="_blank" rel="noreferrer">
            Privacy Policy
          </Link>
          . Requests and attachments are processed by email and security
          providers, which may operate outside Canada. This does not subscribe
          me to marketing.
        </span>
      </label>
      <label className="checkbox">
        <input type="checkbox" name="uploadRights" value="true" required />
        <span>
          I am authorized to share these files and permit their use to evaluate
          my project. I have read the{" "}
          <Link href="/terms" target="_blank" rel="noreferrer">
            website terms
          </Link>{" "}
          and{" "}
          <Link href="/order-policy" target="_blank" rel="noreferrer">
            order policy
          </Link>
          . Submitting a request does not place an order or authorize
          production.
        </span>
      </label>
    </>
  );
}
