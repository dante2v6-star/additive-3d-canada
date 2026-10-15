import { business } from "@/config/business";
import { legal } from "@/config/legal";
export function LegalContact() {
  const email = legal.privacyEmail || business.email;
  return (
    <p>
      <strong>{legal.legalName || business.name}</strong>
      {legal.registrationInProgress && (
        <>
          <br />
          Business registration is in progress.
        </>
      )}
      <br />
      {business.postalAddress}
      <br />
      Privacy contact: {legal.privacyOfficer}
      <br />
      {email ? (
        <a href={`mailto:${email}`}>{email}</a>
      ) : (
        <>
          Contact email is being finalized. Write to the address above or reply
          to a request confirmation.
        </>
      )}
      {business.phone && (
        <>
          <br />
          {business.phone}
        </>
      )}
    </p>
  );
}
export function PolicyStatus() {
  return (
    <>
      <p className="micro">Policy version: {legal.version}</p>
      {!legal.reviewed && (
        <p className="notice warning">
          These policies are being finalized for public launch and require
          review against the actual business practices.
        </p>
      )}
    </>
  );
}
