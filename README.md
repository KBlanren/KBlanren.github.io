# 个人学术网站 - 使用说明

## 网站结构

```
personal-academic-site/
├── index.html              # 主框架（不要修改）
├── css/
│   └── style.css           # 样式文件（可自定义颜色）
├── js/
│   └── main.js             # 引擎（不要修改）
└── content/                # 你的内容都在这里！
    ├── courses/             # 公开课笔记
    ├── papers/              # 论文笔记
    ├── blog/                # Blog
    └── dsge/                # DSGE 模型图鉴
```

## 快速开始

### 1. 本地预览

直接用浏览器打开 `index.html` 文件即可看到网站。

> **注意**：因为 Markdown 文件是通过 `fetch` 加载的，如果你直接双击打开 `index.html`，某些浏览器可能会因安全限制无法加载内容。解决方法：
> - 使用 VS Code 的 **Live Server** 插件
> - 或用 Python 临时启服务器：`python -m http.server 8000`

### 2. 添加新内容

只需要在 `content/` 下的对应文件夹里创建 `.md` 文件，然后在 `index.html` 的导航栏里加一个链接即可。

**步骤示例**：添加一篇 "行为金融学" 笔记到公开课

1. 创建文件：`content/courses/behavioral-finance.md`
2. 用 Markdown + LaTeX 写内容：
   ```markdown
   # 行为金融学
   
   前景理论的价值函数：
   $$ v(x) = \begin{cases} x^\alpha & x \geq 0 \\ -\lambda (-x)^\beta & x < 0 \end{cases} $$
   ```
3. 打开 `index.html`，找到 `nav-menu` 里的公开课部分，添加一行：
   ```html
   <li><a href="#courses/behavioral-finance" class="nav-link" data-path="courses/behavioral-finance"><span class="icon">🧠</span> 行为金融学</a></li>
   ```

完成！刷新页面即可看到新内容。

## LaTeX 支持

网站使用 **MathJax 3** 自动渲染 LaTeX 公式。支持两种写法：

- **行内公式**：`$E = mc^2$` 或 `\(E = mc^2\)`
- **独立公式**：`$$E = mc^2$$` 或 `\[E = mc^2\]`

## 部署到 GitHub Pages（免费 + 国内可访问）

### 步骤一：创建 GitHub 仓库

1. 注册/登录 [github.com](https://github.com)
2. 点击 **New repository**
3. 仓库名设为 `你的用户名.github.io`（例如 `zhangsan.github.io`）
4. 设为 **Public**
5. 点击 **Create repository**

### 步骤二：上传文件

**方法 A：网页上传（最简单）**

1. 进入仓库页面，点击 **Add file → Upload files**
2. 把 `personal-academic-site` 文件夹里的**所有文件和文件夹**拖进去
   - 注意：不要上传外层文件夹，而是里面的内容（index.html, css/, js/, content/）
3. 填写提交信息，点击 **Commit changes**

**方法 B：Git 命令（推荐）**

```bash
cd personal-academic-site
git init
git add .
git commit -m "init: 个人学术网站"
git branch -M main
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git push -u origin main
```

### 步骤三：启用 GitHub Pages

1. 仓库页面点击 **Settings**
2. 左侧选择 **Pages**
3. Source 选择 **Deploy from a branch**
4. Branch 选择 **main**，文件夹选 **/(root)**
5. 点击 **Save**

等待 1-2 分钟，然后访问：

```
https://你的用户名.github.io
```

即可看到你的网站！

## 自定义域名（可选）

如果你有自己的域名，可以在仓库根目录添加 `CNAME` 文件，内容为：

```
www.yourdomain.com
```

然后在域名 DNS 添加 CNAME 记录指向 `你的用户名.github.io`。

## 注意事项

- **GitHub Pages 免费额度**：公开仓库完全免费，每月有 100GB 带宽和 1GB 存储限制，个人网站完全够用
- **国内访问**：`github.io` 域名在国内大部分地区可正常访问，速度取决于网络环境。如需更快速度，可考虑 Gitee Pages 或 Vercel（但后者可能需要特定网络环境）
- **更新内容**：修改 Markdown 后 `git add . && git commit -m "update" && git push`，网站会自动更新

## 技术栈

| 组件 | 用途 | 来源 |
|------|------|------|
| HTML5 + CSS3 | 页面结构与样式 | 原生 |
| marked.js | Markdown 渲染 | jsDelivr CDN |
| MathJax 3 | LaTeX 公式渲染 | jsDelivr CDN |
| GitHub Pages | 免费托管 | GitHub |

---

有任何问题，随时问我！
