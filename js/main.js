// 主引擎：视差效果、路由、Markdown 加载、MathJax 渲染

const docCategory = document.getElementById('doc-category');
const docDate = document.getElementById('doc-date');
const contentArea = document.getElementById('content-area');
const topNav = document.getElementById('topNav');
const heroBg = document.getElementById('heroBg');
const heroTitle = document.getElementById('heroTitle');

const PATH_META = {
    'home': { category: 'Home', date: '2025' },
    'blog': { category: 'Blog', date: '2025' },
    'contributors': { category: 'Contributors', date: '2025' }
};

const HOME_HTML = `
<div class="home-intro">
    <div class="home-text">
        <h1>Welcome to LANREN.COM</h1>
        <p>这是我和我朋友们的唐网站，我们会在这里更新学习笔记、博客、和恐怖小说。</p>
        <p>欢迎随便逛逛，内容不定期更新。</p>
    </div>
    <div class="pixel-guy-wrap">
        <div class="pixel-guy">
            <div class="leg-l"></div>
            <div class="leg-r"></div>
        </div>
    </div>
</div>
`;

const NOT_FOUND_HTML = `
<div class="error-box">
    <h2>⚠ 内容未找到</h2>
    <p>该内容暂时不存在，请从导航栏选择其他内容。</p>
    <p style="margin-top: 12px; font-size: 0.9rem;">新建文件：content/xxx/xxx.md</p>
</div>
`;

// 全局 manifest 缓存
let contentManifest = null;

// 加载 manifest.json
async function loadManifest() {
    try {
        const resp = await fetch('content/manifest.json');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        contentManifest = await resp.json();
    } catch (err) {
        console.error('Manifest load failed:', err);
        contentManifest = {};
    }
}

// 根据 manifest 动态渲染 HORROR 下拉菜单（桌面端 + 移动端）
function renderDropdowns() {
    if (!contentManifest) return;

    // 桌面端 HORROR
    const horrorDesktop = document.getElementById('horrorDropdown');
    if (horrorDesktop && contentManifest.horror) {
        horrorDesktop.innerHTML = contentManifest.horror.map(item =>
            `<a href="#content" class="dropdown-item" data-path="${item.path}">${item.title}</a>`
        ).join('');
    }

    // 移动端 HORROR
    const horrorMobile = document.getElementById('mobileHorrorDropdown');
    if (horrorMobile && contentManifest.horror) {
        horrorMobile.innerHTML = contentManifest.horror.map(item =>
            `<a href="#content" class="mobile-dropdown-item" data-path="${item.path}">${item.title}</a>`
        ).join('');
    }

    // 重新绑定新生成的导航项点击事件
    document.querySelectorAll('.dropdown-item[data-path], .mobile-dropdown-item[data-path]').forEach(link => {
        link.removeEventListener('click', handleNavClick); // 防止重复绑定
        link.addEventListener('click', handleNavClick);
    });
}

// 渲染某个分类的文章列表（用于 BLOG 等非下拉分类）
function renderCategoryList(category) {
    const items = contentManifest[category] || [];
    if (items.length === 0) {
        contentArea.innerHTML = `
            <div class="error-box">
                <h2>⚠ 暂无内容</h2>
                <p>该分类下还没有文章。</p>
                <p style="margin-top: 12px; font-size: 0.9rem;">新建文件：content/${category}/xxx.md</p>
            </div>
        `;
        return;
    }

    const listHtml = items.map(item => `
        <a href="#${item.path}" class="category-list-item" data-path="${item.path}">
            <span class="category-list-title">${item.title}</span>
            <span class="category-list-arrow">→</span>
        </a>
    `).join('');

    contentArea.innerHTML = `
        <div class="category-list">
            <h1>${category.toUpperCase()}</h1>
            <div class="category-list-items">${listHtml}</div>
        </div>
    `;

    // 绑定列表项点击事件
    document.querySelectorAll('.category-list-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = link.dataset.path;
            if (path) {
                window.location.hash = path;
                closeMobileMenu();
            }
        });
    });

    if (window.MathJax) {
        MathJax.typesetPromise([contentArea]).catch(() => {});
    }
}
function updateHeader(path) {
    const meta = PATH_META[path] || { category: 'Archive', date: '2025' };
    if (docCategory) docCategory.textContent = meta.category;
    if (docDate) docDate.textContent = meta.date;
}

// file:// 协议下加载本地文件的辅助函数
function loadFileXHR(filePath) {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.overrideMimeType('text/plain');
        xhr.open('GET', 'content/' + filePath + '.md', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 0 || xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    resolve('');
                }
            }
        };
        xhr.onerror = () => resolve('');
        xhr.send();
    });
}

// 加载 Markdown
async function loadMarkdown(path) {
    contentArea.innerHTML = '<div class="loading">Loading content</div>';
    updateHeader(path);

    const isFileProtocol = window.location.protocol === 'file:';
    let markdownText = '';
    let fetchFailed = false;

    try {
        if (isFileProtocol) {
            // file:// 协议下直接使用原始路径（XMLHttpRequest 会自动处理编码）
            markdownText = await loadFileXHR(path);
        } else {
            // http:// 协议下 URL 编码中文字符
            const response = await fetch('content/' + encodeURIComponent(path) + '.md');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            markdownText = await response.text();
        }
    } catch (err) {
        console.error('Load error:', err);
        fetchFailed = true;
    }

    if (fetchFailed || !markdownText) {
        contentArea.innerHTML = isFileProtocol
            ? '<div class="error-box"><h2>⚠ 无法加载本地文件</h2><p>通过 file:// 直接打开时，浏览器安全策略会阻止加载 content/ 下的 Markdown 文件。</p><p style="margin-top: 16px;"><strong>请用以下任意方式打开：</strong></p><ul style="text-align:left; margin-top:12px;"><li>VS Code 安装 <strong>Live Server</strong> 插件，右键 "Open with Live Server"</li><li>在文件夹内运行 <strong>python -m http.server 8000</strong>，然后访问 localhost:8000</li><li>或用 Node.js：<strong>npx serve .</strong></li></ul></div>'
            : NOT_FOUND_HTML;
        return;
    }

    const html = marked.parse(markdownText);
    contentArea.innerHTML = html;

    if (window.MathJax) {
        MathJax.typesetPromise([contentArea]).catch(err => console.error('MathJax error:', err));
    }
}

// 加载首页
function loadHome() {
    contentArea.innerHTML = HOME_HTML;
    updateHeader('home');
    if (window.MathJax) {
        MathJax.typesetPromise([contentArea]).catch(() => {});
    }
}

// 团队成员数据（照片放在 images/ 文件夹下，按人名命名如：蓝人王.jpg、FIN.jpg）
const CONTRIBUTORS = [
    {
        name: '蓝人王',
        role: 'Founder & Chief Editor',
        photo: 'images/蓝人王.png'
    },
    {
        name: 'FIN',
        role: 'Co-Founder & Horror Writer',
        photo: 'images/FIN.png'
    }
];

// 渲染贡献页
function renderContributors() {
    updateHeader('contributors');

    const membersHtml = CONTRIBUTORS.map(person => `
        <div class="contributor-card">
            <div class="contributor-avatar-wrap">
                <img src="${person.photo}" alt="${person.name}" class="contributor-avatar" onerror="this.style.display='none';this.parentElement.innerHTML+='<div class=\\'contributor-avatar-placeholder\\'>?</div>'">
            </div>
            <div class="contributor-role">${person.role}</div>
            <div class="contributor-name">▶ ${person.name}</div>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="contributors-page">
            <h1 class="contributors-title">Our Team</h1>
            <div class="contributors-grid">${membersHtml}</div>
        </div>
    `;

    if (window.MathJax) {
        MathJax.typesetPromise([contentArea]).catch(() => {});
    }
}

// 滚动到内容区
function scrollToContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        const offset = mainContent.offsetTop - 64;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }
}

// 处理路由
function handleRoute(path) {
    // 更新导航高亮
    document.querySelectorAll('.nav-link, .dropdown-item, .mobile-link, .mobile-dropdown-item').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.path === path) link.classList.add('active');
    });

    // 加载内容
    if (path === 'home' || !path) {
        loadHome();
    } else if (path === 'blog') {
        // BLOG 现在显示分类列表
        updateHeader('blog');
        renderCategoryList('blog');
    } else if (path === 'contributors') {
        renderContributors();
    } else {
        loadMarkdown(path);
    }
}

// 导航点击处理
function handleNavClick(e) {
    e.preventDefault();
    const path = e.currentTarget.dataset.path;
    if (!path) return;
    window.location.hash = path;
    closeMobileMenu();
}

// 首页滚动箭头
function handleScrollDown() {
    scrollToContent();
}

// 导航栏滚动效果
function handleNavScroll() {
    if (window.scrollY > 50) {
        topNav.classList.add('scrolled');
    } else {
        topNav.classList.remove('scrolled');
    }
}

// Hero 视差效果（鼠标）
function handleHeroParallax(e) {
    if (!heroBg || !heroTitle) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    heroBg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    heroTitle.style.transform = `translate(${-x * 0.5}px, ${-y * 0.5}px)`;
}

// Hero 滚动视差
function handleHeroScroll() {
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;

    if (scrollY < heroHeight && heroBg) {
        const progress = scrollY / heroHeight;
        heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
        if (heroTitle) {
            heroTitle.style.opacity = 1 - progress * 0.8;
            heroTitle.style.transform = `translateY(${scrollY * 0.2}px)`;
        }
    }
}

// 移动端菜单
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');

function openMobileMenu() {
    mobileMenu.classList.add('show');
    overlay.classList.add('show');
}

function closeMobileMenu() {
    mobileMenu.classList.remove('show');
    overlay.classList.remove('show');
}

mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.contains('show') ? closeMobileMenu() : openMobileMenu();
});

overlay.addEventListener('click', closeMobileMenu);

// 初始化绑定
document.addEventListener('DOMContentLoaded', async () => {
    // 先加载 manifest，再渲染下拉菜单和初始路由
    await loadManifest();
    renderDropdowns();

    // 绑定所有导航点击（包括下拉项和移动端项）
    document.querySelectorAll('.nav-link[data-path], .dropdown-item[data-path], .mobile-link[data-path], .mobile-dropdown-item[data-path]').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // 桌面端下拉：点击 trigger 也支持展开
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const dropdown = trigger.closest('.nav-dropdown');
            dropdown.classList.toggle('active');
        });
    });

    // 滚动箭头
    const scrollDown = document.getElementById('scrollDown');
    if (scrollDown) scrollDown.addEventListener('click', handleScrollDown);

    // 滚动监听
    window.addEventListener('scroll', () => {
        handleNavScroll();
        handleHeroScroll();
    });

    // 鼠标视差
    document.addEventListener('mousemove', handleHeroParallax);

    // 处理初始路由
    const hash = decodeURIComponent(window.location.hash.slice(1)) || 'home';
    handleRoute(hash);
    if (hash !== 'home') {
        setTimeout(() => scrollToContent(), 150);
    }
});

// hash 变化监听
window.addEventListener('hashchange', () => {
    const hash = decodeURIComponent(window.location.hash.slice(1)) || 'home';
    handleRoute(hash);
    if (hash !== 'home') {
        scrollToContent();
    }
});
