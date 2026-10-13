import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="journal">
      <header className="journal-intro">
        <h1>기록을 찾을 수 없어요.</h1>
        <p>아직 공개되지 않았거나 없는 작품입니다.</p>
      </header>
      <Link className="back-link" href="/">
        모든 기록 보기
      </Link>
    </main>
  );
}
