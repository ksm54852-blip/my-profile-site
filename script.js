/* ==========================================================================
   script.js
   기능별로 작은 함수를 만들고, 맨 아래에서 한 번에 실행합니다.
   ========================================================================== */

/* --------------------------------------------------------------------------
   프로젝트 목록
   포트폴리오를 바꾸고 싶다면 이 배열만 수정하면 됩니다.
   demo / code에 실제 주소를 넣으면 카드의 링크가 그 주소를 가리킵니다.
   ('#'인 동안에는 링크가 흐리게 표시되고 눌러도 아무 일이 일어나지 않습니다.)
   -------------------------------------------------------------------------- */
const projects = [
  {
    title: 'To-Do 앱',
    description: '할 일을 추가하고 삭제할 수 있는 목록입니다. localStorage에 저장해 새로고침해도 내용이 남습니다.',
    tags: ['HTML', 'CSS', 'JavaScript', 'localStorage'],
    emoji: '📝',
    demo: '#',
    code: '#'
  },
  {
    title: '날씨 앱',
    description: '도시 이름을 입력하면 현재 날씨를 보여줍니다. fetch로 API를 호출하고 비동기 처리를 연습했습니다.',
    tags: ['JavaScript', 'fetch', 'async/await'],
    emoji: '🌤️',
    demo: '#',
    code: '#'
  },
  {
    title: '계산기',
    description: '사칙연산이 가능한 계산기입니다. 버튼 이벤트 처리와 화면 상태 관리를 연습했습니다.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    emoji: '🧮',
    demo: '#',
    code: '#'
  }
];

/* --------------------------------------------------------------------------
   1. 프로젝트 카드 그리기
   projects 배열을 카드 HTML로 바꿔서 #project-list 안에 넣습니다.
   -------------------------------------------------------------------------- */
function renderProjects() {
  const list = document.getElementById('project-list');
  if (!list) return;

  list.innerHTML = projects
    .map(function (project) {
      // 기술 태그 배지
      const tags = project.tags
        .map(function (tag) {
          return (
            '<span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">' +
            tag +
            '</span>'
          );
        })
        .join('');

      // 주소가 아직 '#'이면 링크를 흐리게 보여줍니다.
      const linkStyle = function (url) {
        return url === '#'
          ? 'pointer-events-none opacity-40'
          : 'hover:text-brand dark:hover:text-brand-light';
      };

      return [
        '<article class="reveal flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900">',
        '  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/10 to-sky-500/10 text-2xl">' + project.emoji + '</div>',
        '  <h3 class="mb-2 text-lg font-bold text-slate-900 dark:text-white">' + project.title + '</h3>',
        '  <p class="mb-4 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">' + project.description + '</p>',
        '  <div class="mb-5 flex flex-wrap gap-1.5">' + tags + '</div>',
        '  <div class="flex gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">',
        '    <a href="' + project.demo + '" class="transition-colors ' + linkStyle(project.demo) + '">데모 보기</a>',
        '    <a href="' + project.code + '" class="transition-colors ' + linkStyle(project.code) + '">코드 보기</a>',
        '  </div>',
        '</article>'
      ].join('\n');
    })
    .join('');
}

/* --------------------------------------------------------------------------
   2. 다크모드 토글
   <html>에 dark 클래스를 붙였다 뗐다 하고, 선택을 localStorage에 저장합니다.
   해/달 아이콘은 CSS(dark:block, dark:hidden)가 알아서 바꿔줍니다.
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  button.addEventListener('click', function () {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      /* 저장할 수 없는 환경이라면 이번 방문에만 적용됩니다. */
    }
  });
}

/* --------------------------------------------------------------------------
   3. 모바일 햄버거 메뉴
   버튼을 누르면 메뉴 패널이 열리고, 메뉴를 고르면 다시 닫힙니다.
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const button = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconHamburger = document.getElementById('icon-hamburger');
  const iconClose = document.getElementById('icon-close');
  if (!button || !menu) return;

  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    iconHamburger.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }

  button.addEventListener('click', function () {
    const isOpen = !menu.classList.contains('hidden');
    setMenu(!isOpen);
  });

  // 메뉴 항목을 누르면 자동으로 닫습니다.
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenu(false);
    });
  });

  // 화면이 넓어지면(데스크톱 메뉴가 보이면) 열려 있던 패널을 정리합니다.
  window.matchMedia('(min-width: 768px)').addEventListener('change', function (event) {
    if (event.matches) setMenu(false);
  });
}

/* --------------------------------------------------------------------------
   4. 스크롤 등장 애니메이션
   IntersectionObserver는 "이 요소가 화면에 들어왔는지"를 알려주는 기능입니다.
   화면에 들어온 요소에 .active를 붙이고, 한 번 나타난 요소는 관찰을 멈춥니다.
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');

  // 지원하지 않는 브라우저에서는 그냥 전부 보이게 합니다.
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) {
      el.classList.add('active');
    });
    fillSkillBars();
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('active');

        // 기술 스택 섹션이 나타나면 숙련도 바를 채웁니다.
        const bars = entry.target.querySelectorAll('.skill-bar');
        bars.forEach(function (bar) {
          bar.style.width = bar.dataset.level + '%';
        });

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
}

// 애니메이션 없이 숙련도 바를 바로 채우는 예비 동작
function fillSkillBars() {
  document.querySelectorAll('.skill-bar').forEach(function (bar) {
    bar.style.width = bar.dataset.level + '%';
  });
}

/* --------------------------------------------------------------------------
   5. 연락처 폼
   실제로 전송하지는 않고, 입력값 검증과 안내 메시지까지만 처리합니다.
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  // 입력칸 아래에 오류 문구를 보여주거나 지웁니다.
  function setError(input, message) {
    const target = input.parentElement.querySelector('.error-message');
    if (!target) return;
    target.textContent = message || '';
    target.classList.toggle('hidden', !message);
    input.classList.toggle('border-red-500', Boolean(message));
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // 페이지가 새로고침되지 않도록 막습니다.

    const name = form.elements.name;
    const email = form.elements.email;
    const message = form.elements.message;
    let valid = true;

    // 이름: 비어 있으면 안 됩니다.
    if (!name.value.trim()) {
      setError(name, '이름을 입력해주세요.');
      valid = false;
    } else {
      setError(name, '');
    }

    // 이메일: 비어 있지 않고, @와 점이 들어간 형태여야 합니다.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setError(email, '이메일을 입력해주세요.');
      valid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      setError(email, '이메일 형식이 올바르지 않습니다.');
      valid = false;
    } else {
      setError(email, '');
    }

    // 메시지: 최소 10자 이상
    if (!message.value.trim()) {
      setError(message, '메시지를 입력해주세요.');
      valid = false;
    } else if (message.value.trim().length < 10) {
      setError(message, '메시지를 10자 이상 입력해주세요.');
      valid = false;
    } else {
      setError(message, '');
    }

    if (!valid) {
      status.classList.add('hidden');
      return;
    }

    // 여기까지 왔다면 검증 통과.
    // 실제 서비스라면 이 자리에서 fetch로 서버에 보내면 됩니다.
    status.textContent = '메시지가 전송되었습니다. (데모이므로 실제로 전달되지는 않습니다.)';
    status.classList.remove('hidden');
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   6. 현재 보고 있는 섹션의 내비 링크 강조
   -------------------------------------------------------------------------- */
function initActiveNavLink() {
  const links = document.querySelectorAll('.nav-link');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const sections = [];
  links.forEach(function (link) {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sections.push(section);
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', isCurrent);
        });
      });
    },
    // 화면 중앙 부근에 걸친 섹션을 "지금 보는 섹션"으로 봅니다.
    { rootMargin: '-45% 0px -45% 0px' }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
}

/* --------------------------------------------------------------------------
   실행
   프로젝트 카드에도 .reveal이 들어 있으므로,
   카드를 먼저 그린 다음 스크롤 애니메이션을 준비해야 합니다.
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  renderProjects();
  initThemeToggle();
  initMobileMenu();
  initScrollReveal();
  initContactForm();
  initActiveNavLink();
});
