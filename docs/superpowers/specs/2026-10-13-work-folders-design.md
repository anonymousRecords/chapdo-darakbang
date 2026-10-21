# 작품 폴더와 작성 흐름

사용자가 승인한 구조 평가를 적용한다. apps/gallery를 apps/web으로 이름 변경하고 기존 네 글을 works/<slug>/post.mdx로 이동한다. 제목·날짜·초안·실행 방식은 post.mdx에만 둔다. renderer: react는 같은 폴더 Artwork.tsx를 지연 로딩하고 renderer: iframe은 기존 interaction ID를 사용한다. 기존 Vite 작품과 URL은 유지한다.

pnpm new:work <slug> --title <title> 명령은 React 작품·CSS Module·초안 글을 생성한다. iframe을 선택하면 검증된 기존 interaction을 연결하는 글만 만든다. slug는 소문자 영문·숫자·하이픈을 허용하고 중복 경로는 거절한다. 개발 서버는 초안과 미래 글을 포함하며 작품 목록 변경을 감시해 레지스트리를 재생성한다. 프로덕션은 초안과 미래 글의 경로 및 React 등록을 제외한다.

공통 화면은 상세 레이아웃, 모바일 접근 안내, React 실행 오류 경계를 제공한다. 작품 CSS는 CSS Module로 제한하고 브라우저 자원은 작품 useEffect에서 정리한다. React 작품은 ssr:false로 브라우저에서만 실행해 브라우저 전용 라이브러리도 사용할 수 있게 한다. 이미지 import는 작품 폴더에, URL로 참조할 음원·영상은 public/works/<slug>에 둔다.

등록 파일은 자동 생성하고 Git에서 제외한다. dev/build/check-types/new:work는 필요한 레지스트리를 자동 준비한다. Turbo web 빌드는 날짜에 민감하므로 캐시하지 않는다. 배포 설정에 기존 apps/gallery 경로가 있다면 apps/web으로 변경해야 하며 외부 설정은 이 작업에서 변경하지 않는다.
