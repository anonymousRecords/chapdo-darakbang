# Work Folders Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans in the existing isolated worktree.

**Goal:** 작품 한 폴더와 명령 하나로 작성·미리보기·게시한다.
**Architecture:** apps/web, works/<slug>/post.mdx, 선택적인 Artwork.tsx, 자동 생성된 지연 로딩 맵.
**Tech Stack:** 기존 Next.js/React/MDX/TypeScript, Node fs watch와 node:test.
**Spec:** docs/superpowers/specs/2026-10-13-work-folders-design.md

## Global Constraints
- 기존 글의 본문·날짜·URL을 보존한다.
- React와 iframe의 입력을 구분해 검증한다.
- 개발 미리보기와 배포 공개 범위를 분리한다.
- 중복 생성은 기존 파일을 덮어쓰지 않는다.

## Review Focus
- 폴더 이름으로 경로를 벗어나거나 기존 작품을 덮어쓸 수 없어야 한다.
- draft/미래 React 코드가 배포 등록 목록에 들어가지 않아야 한다.
- 기존 meta.json의 ID로 iframe과 개발 포트를 연결해야 한다.
- Next 단독 실행과 전체 모노레포 실행 양쪽에서 생성 파일이 준비되어야 한다.
- web으로 이름 변경한 뒤 빌드·ignore·lockfile·배포 안내가 일치해야 한다.

### Task 1: 폴더 로더와 생성 명령
- [x] 기존 날짜 테스트를 폴더 형태로 바꾸고 renderer·미리보기·생성 충돌 테스트를 먼저 실행한다.
- [x] 작품 스키마와 폴더 로딩, scaffold를 구현하고 테스트를 통과시킨다.

### Task 2: 실행과 구조 이관
- [x] apps/gallery→apps/web, 기존 글→works/<slug>/post.mdx 이동 및 모든 참조 갱신.
- [x] 공개 React 작품만 포함하는 lazy registry, React/iframe 프레임, dev watcher 연결.
- [x] CLI 인자 검증·레지스트리 준비·lockfile·작성 안내 갱신.

### Task 3: 검증
- [x] 테스트, lint, 타입 검사와 전체 작품/Next 빌드 실행.
- [x] 임시 React 작품을 명령으로 생성해 개발 초안/공개 빌드 경로를 검증한 뒤 제거.
- [x] 최종 공개 경로와 기존 작품 HTTP 응답 검증, 독립 코드 리뷰.


## Verification results
- 16 automated tests passed; web lint and TypeScript checks passed.
- Full root build passed for all 19 legacy artworks and Next.js.
- CLI-generated React work verified in development as a draft, then in the production export after publishing. A separate draft was excluded from production routes and imports.
- Reproduced and fixed stale registry entries on work folder rename/deletion; verified live updates for both operations.
- Removed temporary works and rebuilt web successfully with exactly four author posts.
- HTTP checks passed for four posts, author story markup, previous/next navigation, 19 artwork URLs, Next assets and unknown-post 404.
- Independent code review completed. No connected browser was available, so visual rendering and interactive browser behavior were not verified.
- External deployment settings and remote branches were not changed. Deployment output is now apps/web/out.
