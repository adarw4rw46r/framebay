import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="mt-8 text-center text-xs text-muted">
      By using Framebay, you agree to our{" "}
      <Link href="/terms" className="text-violet-300 hover:text-violet-200">Terms</Link>{" "}
      and{" "}
      <Link href="/privacy" className="text-violet-300 hover:text-violet-200">Privacy Policy</Link>.
    </footer>
  );
}
