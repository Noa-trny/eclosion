import Link from "next/link";
import { Experience } from "@/components/Experience";

export default function Home() {
  return (
    <>
      <noscript>
        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p>
            Cette expérience nécessite JavaScript et WebGL.{" "}
            <Link href="/fallback">Découvrir la version accessible du récit</Link>.
          </p>
        </div>
      </noscript>
      <Experience />
    </>
  );
}
