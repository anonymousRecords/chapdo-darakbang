# 찹도 다락방

Next.js 사이트와 작품 일지를 관리합니다. 작품별로 글과 코드를 함께 보관합니다.

```text
apps/web/
  app/works/[slug]/page.tsx    # 공통 상세 페이지
  works/<slug>/
    post.mdx                 # 제목·날짜·제작 이유·게시 상태
    Artwork.tsx              # React 작품의 기본 export
    artwork.module.css       # 작품 전용 CSS Module
  components/                # 공통 작품 프레임·본문
  lib/                       # 글 읽기·검증·생성
  scripts/                   # 생성 CLI와 개발 서버
  public/works/<slug>/        # URL로 참조할 음원·영상
```

## 새 작품 작성

Node.js 24.x와 pnpm 12.11.2를 사용합니다. `.node-version`에는 로컬 검증 버전 24.21.0을 기록하고, 루트 `package.json`의 `packageManager`로 pnpm 버전을 고정합니다.

저장소 루트에서 실행합니다.

```sh
pnpm install --frozen-lockfile
pnpm new:work falling-dots --title "떨어지는 점"
pnpm dev:web
```

`works/falling-dots/`에 React 컴포넌트, CSS Module, MDX 초안을 만듭니다. 날짜는 한국 기준 오늘이며 `--date 2026-10-13`으로 지정할 수 있습니다. http://localhost:3000/works/falling-dots/ 에서 확인하고 코드와 제작 이유를 수정합니다. 생성한 글은 `draft: true`라 개발 서버에서만 표시됩니다. 기존 폴더와 겹치면 덮어쓰지 않고 실패합니다.

```mdx
---
title: "떨어지는 점"
date: "2026-10-13"
renderer: react
desktopOnly: false
draft: true
---

내가 이 작품을 만든 이유를 적습니다.
```

작품 이름은 소문자 영문·숫자·하이픈으로 지정하며 폴더명이 상세 URL입니다. 날짜·제목은 MDX에서만 관리합니다. React 작품은 별도의 앱·포트·수동 등록 파일을 만들 필요가 없습니다. 실행 컴포넌트는 `Artwork.tsx`에서 기본 export합니다. 개발 서버는 MDX와 작품 파일 변경을 감시하며 등록 정보를 갱신합니다. 수동으로 폴더를 추가해도 같은 규칙이 적용됩니다.

## 기존 Vite 작품 연결

```sh
pnpm new:work traffic-study --title "신호등 관찰 기록" --renderer iframe --interaction traffic-light
pnpm dev
```

iframe 글에는 `renderer: iframe`과 기존 앱의 meta.json `id`를 가리키는 `interaction`을 적습니다. 이 경우 React 파일을 만들지 않습니다. 기존 작품 코드는 `apps/<interaction>/`에 유지하고 글은 `apps/web/works/<slug>/post.mdx`에서 관리합니다. 기존 `/interactions/<id>/` 주소는 유지됩니다.

`pnpm dev`는 Next.js와 기존 Vite 개발 서버를 함께 실행합니다. `pnpm dev:web`은 Next.js만 실행하므로 React 작품 작업에 적합합니다. iframe 작품은 해당 Vite 서버가 필요합니다. 기존 `pnpm dev:gallery`와 `pnpm gallery`도 `dev:web`의 별칭으로 남겨 두었습니다.

## 작품 작성 규칙

- React 작품은 브라우저에서 지연 로딩합니다. 페이지의 글과 날짜는 정적으로 생성됩니다.
- 작품 CSS는 `artwork.module.css`로 작성하고 전역 body/html 스타일은 피합니다.
- `window` 이벤트, 타이머, requestAnimationFrame, WebGL 자원은 useEffect의 cleanup에서 정리합니다.
- 특정 DOM 구조나 전역 CSS에 의존하는 기존 작품은 iframe을 사용합니다.
- 작품 이미지는 폴더 안에서 import할 수 있습니다. URL이 필요한 음원·영상은 `public/works/<slug>/`에 두고 `/works/<slug>/파일명`으로 참조합니다.
- `desktopOnly: true` 작품은 작은 화면에서 체험 안내를 보여주며 글은 계속 읽을 수 있습니다.

## 게시와 배포

`post.mdx`의 `draft`를 false로 바꾸고 루트에서 `pnpm build`를 실행합니다. 모든 기존 작품과 Next.js 페이지가 `apps/web/out`에 출력됩니다. 생성된 작품 레지스트리는 직접 수정하거나 커밋하지 않습니다.

초안과 한국 날짜 기준 미래 글은 배포 목록·상세 경로·React 등록에서 제외합니다. 미래 글을 공개하려면 해당 날짜 이후 재빌드·배포해야 합니다. 날짜가 달라진 결과를 재사용하지 않도록 web 빌드의 Turbo 캐시를 끕니다. 날짜는 YYYY-MM-DD로 작성하며 화면에는 YY-MM-DD로 표시합니다.

**배포 경로 변경:** 기존 배포 설정에서 `apps/gallery`를 사용했다면 `apps/web`으로 변경해야 합니다. 저장소 루트 기준 빌드 명령은 `pnpm build`, 정적 출력은 `apps/web/out`입니다. 기존 작품 빌드가 포함되도록 루트 빌드 명령을 사용하세요. 외부 Vercel 프로젝트 설정은 별도로 확인해야 합니다.

## 검증

```sh
pnpm test
pnpm --filter web lint
pnpm --filter web check-types
pnpm build
```


## GIF 미리보기

기존 iframe 작품은 `public/works/<slug>/preview.gif`가 있으면 상세 페이지와 바텀시트에서 GIF를 표시합니다. GIF 아래에는 원본 작품명(예: `opening-box`)과 ↗ 아이콘을 왼쪽 정렬로 표시하며, `https://chapdo-darakbang.vercel.app/interactions/<id>/`를 새 탭으로 엽니다. 모바일에서도 GIF는 표시되며 원본 작품의 기기 제한은 원본에서 유지됩니다.

`poster.webp`는 같은 크기의 정지 화면으로 함께 저장합니다. 동작 줄이기를 설정한 방문자에게는 GIF 대신 이 이미지를 표시합니다. 현재 등록된 19개 작품 모두 실제 브라우저에서 동작을 기록한 720×540 GIF와 정지 미리보기를 제공합니다. 클릭·호버·드래그 효과와 자동 애니메이션 등 각 작품의 동작을 담았습니다.

GIF가 없는 작품은 기존 실시간 미리보기를 사용합니다. 개발 중 원본 링크를 확인하려면 루트 `pnpm build:interactions`로 정적 작품 파일을 준비하세요.


## 기존 작품의 날짜

전체 19개 작품을 등록했습니다. 날짜는 한국 시간 기준 첫 구현 커밋의 작성일이며 실제 제작일이나 게시일을 의미하지 않습니다. `works/commit-dates.json`에 원본 커밋 SHA·작성 시각·메시지를 기록했습니다. 폴더 이동 및 복사된 기본 템플릿 커밋은 제외했습니다. 신호등·상자는 README의 월 표기 대신 확인 가능한 첫 구현 커밋 날짜로 변경했습니다.

기존 제작 이유 네 편은 그대로 유지하고, 나머지 작품의 본문은 비워 두었습니다. 본문이 없으면 제작 이유 영역을 표시하지 않습니다. 19개 작품 모두 GIF 미리보기와 원본 작품 링크를 사용합니다.

## Vercel 빌드 설정

저장소 루트에서 빌드합니다. Root Directory는 비워 두고 Framework Preset은 `Other`, Node.js는 `24.x`, Output Directory는 `apps/web/out`으로 설정합니다. Install Command는 `npx --yes pnpm@12.11.2 install --frozen-lockfile`, Build Command는 `npx --yes pnpm@12.11.2 build`입니다.

pnpm 12의 기본 의존성 검증을 유지합니다. `pnpm-workspace.yaml`의 `allowBuilds`에는 설치 단계에서 필요한 `@swc/core`, `esbuild`, `sharp`만 지정합니다.
