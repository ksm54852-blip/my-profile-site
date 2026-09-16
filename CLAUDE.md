# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

빌드 도구 없이 동작하는 단일 페이지 정적 프로필 사이트입니다. `index.html`, `style.css`, `script.js` 세 파일이 전부이며, 브라우저가 그대로 읽습니다. UI 문구와 코드 주석은 한국어입니다.

## 명령어

**빌드/테스트/린트 도구가 없습니다.** `package.json`, 번들러, 테스트 러너, CI 설정 모두 존재하지 않으므로 `npm run build` / `test` / `lint` 는 이 저장소에서 동작하지 않습니다 (상위 `~/.claude/CLAUDE.md` 의 명령어 목록은 여기에 적용되지 않음).

확인 방법은 브라우저로 직접 여는 것입니다:

```bash
python -m http.server 8000   # 그 후 http://localhost:8000 접속
```

`file://` 로 열어도 대부분 동작하지만, 로컬 서버를 쓰는 편이 `localStorage` 와 상대 경로 처리에서 실제 배포 환경에 가깝습니다. 변경 후에는 **라이트/다크 모드 양쪽과 모바일 폭(768px 미만)을 함께** 확인해야 합니다. 두 축 모두에 분기 로직이 있습니다.

배포는 정적 호스팅(GitHub Pages 등)에 그대로 올리면 됩니다. 별도 산출물 생성 단계가 없습니다.

## 아키텍처

### Tailwind는 CDN + 인라인 설정

`tailwind.config.js` 파일이 없습니다. Tailwind는 CDN 스크립트로 불러오고, 설정은 `index.html` `<head>` 안의 인라인 `<script>` 에 있습니다. 브랜드 컬러(`brand` / `brand-light` / `brand-dark`)나 폰트를 바꾸려면 **그 인라인 설정 블록을 수정**해야 합니다. 새 유틸리티 클래스를 쓸 때 빌드가 필요 없는 대신, CDN 런타임이 클래스명을 문자열로 스캔하므로 클래스명을 동적으로 조립하면 안 됩니다.

### 다크모드는 두 곳이 협력한다

`darkMode: 'class'` 방식이라 `<html>` 의 `dark` 클래스가 유일한 상태입니다. 이를 다루는 코드가 **두 군데로 나뉘어 있으니 함께 수정**해야 합니다.

1. `index.html` `<head>` 의 즉시실행 함수 — 페이지가 그려지기 **전에** `localStorage.theme` 과 `prefers-color-scheme` 을 읽어 클래스를 붙입니다. FOUC(깜빡임) 방지용이라 반드시 `<head>` 안, 렌더링 차단 위치에 있어야 합니다.
2. `script.js` 의 `initThemeToggle()` — 버튼 클릭 시 클래스를 토글하고 `localStorage` 에 저장합니다.

해/달 아이콘 전환은 JS가 아니라 CSS(`dark:block` / `dark:hidden`)가 처리합니다. 두 경로 모두 `localStorage` 접근을 `try/catch` 로 감쌉니다(시크릿 모드 대응).

### CSS와 JS의 역할 분담

`style.css` 에는 **Tailwind CDN이 표현할 수 없는 것만** 둡니다. 나머지 스타일은 전부 HTML 인라인 유틸리티 클래스입니다. 둘 사이에 클래스 이름으로 맺어진 계약이 있습니다:

| 클래스 | CSS가 하는 일 | JS가 하는 일 |
|---|---|---|
| `.reveal` / `.active` | 초기 투명·아래쪽 상태와 전환 정의 | `initScrollReveal()` 이 화면 진입 시 `.active` 부착 |
| `.skill-bar` | `width: 0` 과 전환 속도만 정의 | 실제 `width` 를 HTML의 `data-level` 값에서 읽어 주입 |
| `.nav-link` / `.active` | 활성 색상 (`!important` 로 Tailwind 유틸리티를 덮어씀) | `initActiveNavLink()` 가 현재 섹션에 맞춰 토글 |

`.nav-link.active` 의 `!important` 는 의도적입니다. Tailwind의 `text-slate-600` 등을 이겨야 하므로 제거하면 강조가 사라집니다.

`@media (prefers-reduced-motion: reduce)` 블록이 `.reveal`, `.skill-bar`, smooth scroll을 모두 무효화합니다. 새 애니메이션을 추가하면 이 블록에도 함께 등록해야 합니다.

### script.js 구성과 실행 순서

기능별 `init*()` 함수를 정의하고 맨 아래 `DOMContentLoaded` 핸들러에서 한 번에 호출하는 구조입니다. **호출 순서에 의존성이 있습니다**: `renderProjects()` 가 만드는 프로젝트 카드에도 `.reveal` 이 들어 있으므로, 반드시 `initScrollReveal()` 보다 먼저 실행되어야 합니다.

각 `init*()` 은 대상 요소가 없으면 조용히 `return` 합니다. 섹션을 제거해도 나머지가 깨지지 않습니다.

`IntersectionObserver` 미지원 브라우저를 위한 대체 경로가 있습니다 — `initScrollReveal()` 은 모든 요소에 `.active` 를 붙이고 `fillSkillBars()` 로 바를 즉시 채웁니다. `initActiveNavLink()` 는 그냥 비활성화됩니다.

### 콘텐츠를 어디서 고치는가 (비대칭 주의)

- **프로젝트**: `script.js` 상단의 `projects` 배열이 유일한 출처입니다. 이 배열만 고치면 카드가 바뀝니다. `demo` / `code` 가 `'#'` 인 동안에는 링크가 `pointer-events-none opacity-40` 으로 렌더되어 비활성 상태로 보입니다. 실제 URL을 넣으면 자동으로 활성화됩니다.
- **기술 스택**: 데이터화되어 있지 **않습니다**. `index.html` 의 `#skills` 섹션에 카드가 직접 작성되어 있고, 숙련도는 각 `.skill-bar` 의 `data-level` 속성(백분율)입니다.

`renderProjects()` 는 Tailwind 클래스가 박힌 HTML 문자열을 조립해 `innerHTML` 로 넣습니다. 카드 디자인을 바꾸려면 CSS가 아니라 이 함수 안의 문자열을 수정해야 합니다. 프로젝트 데이터는 하드코딩된 값이므로 현재는 안전하지만, 외부 입력을 이 배열에 넣게 된다면 `innerHTML` 경로를 먼저 손봐야 합니다.

### 섹션과 내비게이션의 연결

섹션 id(`#home`, `#about`, `#skills`, `#projects`, `#contact`)가 앵커 역할을 합니다. `initActiveNavLink()` 는 각 `.nav-link` 의 `href` 값을 그대로 셀렉터로 써서 섹션을 찾으므로, **섹션 id를 바꾸면 데스크톱 메뉴와 모바일 메뉴의 링크를 모두 함께 고쳐야** 합니다. 고정 헤더에 제목이 가리지 않도록 `html { scroll-padding-top: 6rem }` 이 헤더 높이(`h-20`)와 맞춰져 있습니다.

### 연락처 폼

`initContactForm()` 은 **전송하지 않습니다.** `novalidate` 로 브라우저 기본 검증을 끄고 직접 검증한 뒤(이름 필수, 이메일 정규식, 메시지 10자 이상), 성공 시 안내 문구만 표시합니다. 오류 문구는 각 입력칸의 형제 `.error-message` 요소에 씁니다 — 마크업에서 입력칸과 같은 부모 안에 있어야 동작합니다. 실제 전송을 붙인다면 `status.textContent` 를 설정하는 지점이 `fetch` 를 넣을 자리입니다.
