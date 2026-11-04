# Artwork Journal Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan in the existing isolated worktree.

**Goal:** 날짜를 클릭하면 작품과 저자의 제작 이유를 함께 읽는 Next.js 일지.
**Architecture:** 기존 gallery App Router에 MDX 콘텐츠 로더와 /works/[slug] 정적 상세를 추가한다. Vite 작품은 기존 빌드와 iframe 경로를 유지한다.
**Tech Stack:** Next.js 15, React 19, TypeScript, @mdx-js/mdx, gray-matter, remark-gfm, node:test.
**Spec:** docs/superpowers/specs/2026-10-13-artwork-journal-design.md

## Global Constraints
- 기존 작품 URL과 Vite 빌드를 유지한다.
- 미래·초안은 정적 경로에도 포함하지 않는다.
- 기존 월 단위 날짜와 저자의 원문을 보존한다.
- 모바일에서 목록·글을 차단하지 않는다.

## Review Focus
- 잘못된 달력 날짜는 빌드 전에 명확하게 실패해야 한다.
- 한국 자정 경계에서 오늘 글은 포함되어야 한다.
- 초안과 미래 글이 공개 경로에 남지 않아야 한다.
- 모바일에서 글을 읽고 데스크탑 전용 작품 안내를 볼 수 있어야 한다.
- 글 없는 기존 실험도 메인에서 접근할 수 있어야 한다.

### Task 1: 콘텐츠 로딩과 이관
Files: apps/gallery/lib/post-loader.ts, lib/posts.ts, tests/posts.test.ts, content/works/*.mdx.
Interface: readPosts({ directory, interactionIds, today }) returns Post[]; getKoreanDate(now) returns YYYY-MM-DD; getPosts() binds actual content and registry.
- [x] 실제 MDX 임시 파일 테스트를 작성하고 pnpm --filter gallery test로 실패를 확인한다.
- [x] gray-matter로 frontmatter를 읽고 필수 값·날짜·작품 ID 검증, 공개 필터, 최신순 정렬을 구현한다.
- [x] README 네 작품 글을 MDX로 원문 이관한다.
- [x] 콘텐츠 테스트를 통과시킨다.

### Task 2: 일지 화면
Files: app/page.tsx, app/works/[slug]/page.tsx, app/layout.tsx, app/globals.css, app/not-found.tsx, components/Artwork.tsx, components/PostBody.tsx.
Consumes: Post[] and registry getUrl(id, isDev).
- [x] 날짜·제목 목록, 월별 묶음과 기존 실험 목록을 구현한다.
- [x] 상세 정적 경로, metadata, 작품 iframe, MDX 본문, 이전·다음 및 404를 구현한다.
- [x] 모바일 전체 차단을 제거하고 작품 단위 desktopOnly 안내를 적용한다.
- [x] lint, 타입 검사와 전체 production build로 모든 글의 MDX와 작품을 검증한다.

### Task 3: 작성 안내와 실제 사용 검증
Files: README.md, apps/gallery/README.md, docs/superpowers/plans/2026-10-13-artwork-journal.md.
- [x] 새 MDX 예시와 로컬 실행·배포 명령을 작성한다.
- [x] 연결된 브라우저가 없어 직접 화면 검증은 수행하지 못함을 기록한다. 로컬 HTTP 검증으로 날짜 상세 4개, 원문, 이전·다음 링크, 작품 URL 19개, Next assets와 알 수 없는 글의 404를 확인한다.
- [x] 테스트·빌드 결과를 기록하고 변경 파일을 검토한다.


## 검증 기록과 결정
- 콘텐츠 테스트 8개, gallery lint와 check-types 통과.
- 전체 작품 19개 및 Next.js 정적 상세 4개 빌드 통과.
- 정적 서버에서 /works/slug/의 404를 확인하고 trailingSlash로 수정한 뒤 HTTP 검증 통과.
- lint가 .next/out/작품 산출물을 검사하는 문제를 확인하고 생성 파일만 제외.
- 한국 날짜에 따라 공개 글이 달라지므로 gallery#build의 Turbo 캐시를 끄고 out/**를 출력에 추가. 재배포 시 날짜 필터와 작품 파일이 반드시 반영된다.
- Artwork의 체험 가능 상태는 desktopOnly와 실제 화면 폭에서 계산해 상세 간 클라이언트 이동에도 올바르게 적용한다.
- 외부 배포·push·merge는 수행하지 않음. 변경은 작업 워크트리에 보존.
