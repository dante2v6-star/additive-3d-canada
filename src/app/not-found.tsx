import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container legal">
      <div className="eyebrow">404 / PAGE NOT FOUND</div>
      <h1>
        Let’s get you
        <br />
        back on track.
      </h1>
      <p>This page isn’t available.</p>
      <Link className="button" href="/">
        Back to home
      </Link>
    </main>
  );
}
