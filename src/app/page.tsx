import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href="/weather">Weather</Link>
      <div>My APP Home page</div>
    </>
  );
}
