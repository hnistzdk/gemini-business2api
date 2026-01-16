<p align="center">
  <img src="docs/logo.svg" width="120" alt="Gemini Business2API logo" />
</p>
<h1 align="center">Gemini Business2API</h1>
<p align="center">赋予硅基生物以灵魂</p>
<p align="center">当时明月在 · 曾照彩云归</p>
<p align="center">
  <strong>简体中文</strong> | <a href="docs/README_EN.md">English</a>
</p>
<p align="center"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" /> <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" /> <img src="https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white" /> <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white" /> <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" /> <img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" /></p>

<p align="center">
  <a href="https://huggingface.co/spaces/xiaoyukkkk/gemini-business2api?duplicate=true">
    <img src="https://huggingface.co/datasets/huggingface/badges/resolve/main/deploy-to-spaces-md.svg" />
  </a>
</p>

<p align="center">将 Gemini Business 转换为 OpenAI 兼容接口，支持多账号负载均衡、图像生成、多模态能力与内置管理面板。</p>

---

## 📜 开源协议与声明

**开源协议**: MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

**使用声明**:
- ⚠️ **本项目仅限学习与研究用途，禁止用于商业用途**
- 📝 **使用时请保留本声明、原作者信息与开源来源**
- 🔗 **项目地址**: [github.com/Dreamy-rain/gemini-business2api](https://github.com/Dreamy-rain/gemini-business2api)

---

## ✨ 功能特性

- ✅ OpenAI API 完全兼容 - 无缝对接现有工具
- ✅ 多账号负载均衡 - 轮询与故障自动切换
- ✅ 流式输出 - 实时响应
- ✅ 多模态输入 - 100+ 文件类型（图片、PDF、Office 文档、音频、视频、代码等）
- ✅ 图片生成 & 图生图 - 模型可配置，Base64 或 URL 返回
- ✅ 智能文件处理 - 自动识别文件类型，支持 URL 与 Base64
- ✅ 日志与监控 - 实时状态与统计信息
- ✅ 代理支持 - 通过 PROXY 配置
- ✅ 内置管理面板 - 在线配置与账号管理
- ✅ 可选 PostgreSQL 后端 - 支持账户/设置/统计持久化 [感谢PR](https://github.com/Dreamy-rain/gemini-business2api/pull/4)

## 🤖 模型功能

| 模型ID                   | 识图 | 原生联网 | 文件多模态 | 香蕉绘图 |
| ------------------------ | ---- | -------- | ---------- | -------- |
| `gemini-auto`            | ✅    | ✅        | ✅          | 可选     |
| `gemini-2.5-flash`       | ✅    | ✅        | ✅          | 可选     |
| `gemini-2.5-pro`         | ✅    | ✅        | ✅          | 可选     |
| `gemini-3-flash-preview` | ✅    | ✅        | ✅          | 可选     |
| `gemini-3-pro-preview`   | ✅    | ✅        | ✅          | 可选     |

## 🚀 快速开始

### 方式一：使用部署脚本（推荐）

**Linux/macOS:**
```bash
git clone https://github.com/Dreamy-rain/gemini-business2api.git
cd gemini-business2api
bash deploy.sh
```

**Windows:**
```cmd
git clone https://github.com/Dreamy-rain/gemini-business2api.git
cd gemini-business2api
deploy.bat
```

部署脚本会自动完成：
- 构建前端
- 创建 Python 虚拟环境
- 安装依赖
- 创建配置文件

完成后编辑 `.env` 设置 `ADMIN_KEY`，然后运行 `python main.py`

### 方式二：手动部署

```bash
git clone https://github.com/Dreamy-rain/gemini-business2api.git
cd gemini-business2api

# 构建前端
cd frontend
npm install
npm run build
cd ..

# 创建虚拟环境（推荐）
python3 -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate.bat  # Windows

# 安装 Python 依赖
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 设置 ADMIN_KEY
python main.py
```

### 方式三：Docker

```bash
docker build -t gemini-business2api .
docker run -d -p 7860:7860 \
  -e ADMIN_KEY=your_admin_key \
  gemini-business2api
```

### 方式四：前后端分离部署（Vercel + HuggingFace Spaces）

> **适用场景**：HuggingFace Spaces 免费版不支持自定义域名，且 `*.hf.space` 域名在部分地区需要特殊网络环境才能访问。如果你拥有托管在 Cloudflare、Vercel 等平台的自定义域名，可以采用此方案：将前端部署到 Vercel 并绑定自定义域名，通过 Vercel Serverless Function 反向代理 HF Space 后端 API。这样用户只需访问你的自定义域名，无需任何特殊网络配置即可使用全部功能。

**架构说明**：
```
用户 → Vercel (你的域名) → Serverless Function → HuggingFace Space (后端API)
```

**后端部署到 HuggingFace Spaces：**

1. 在 [HuggingFace Spaces](https://huggingface.co/spaces) 创建新 Space，SDK 选择 **Docker**

2. **上传代码**（二选一）：

   **方式 A：Git 推送（推荐）**
   ```bash
   # 克隆你的 HF Space 仓库
   git clone https://huggingface.co/spaces/你的用户名/你的space名
   cd 你的space名

   # 复制本项目必要文件到 Space 目录
   # 必需文件/目录：
   #   core/          - 核心业务逻辑
   #   util/          - 工具函数
   #   Dockerfile     - 容器构建配置
   #   main.py        - 应用入口
   #   requirements.txt - Python 依赖

   # 推送到 HuggingFace
   git add .
   git commit -m "Initial deployment"
   git push
   ```

   **方式 B：网页上传**

   在 Space 的 **Files** 页面点击 **Add file → Upload files**，上传以下文件：
   | 文件/目录 | 说明 |
   |----------|------|
   | `core/` | 核心业务逻辑（整个目录） |
   | `util/` | 工具函数（整个目录） |
   | `Dockerfile` | Docker 构建配置 |
   | `main.py` | FastAPI 应用入口 |
   | `requirements.txt` | Python 依赖清单 |

3. **配置 Space 元数据**：在 README.md 顶部添加 YAML 配置：
   ```yaml
   ---
   title: Your App Name
   emoji: 🚀
   colorFrom: blue
   colorTo: green
   sdk: docker
   app_port: 7860
   pinned: false
   ---
   ```
   > ⚠️ `app_port: 7860` 必须配置，否则所有请求返回 404

4. **配置环境变量**：进入 Space 的 **Settings → Variables and secrets**
   | 变量名 | 类型 | 必填 | 说明 |
   |--------|------|------|------|
   | `ADMIN_KEY` | Secret | ✅ | 管理面板登录密钥 |
   | `DATABASE_URL` | Secret | 推荐 | PostgreSQL 连接串（见下方获取方式） |
   | `API_KEY` | Secret | 可选 | API 接口鉴权密钥 |
   | `PROXY` | Variable | 可选 | HTTP 代理地址 |

5. 将 Space 设置为 **Public**（私有 Space 外部无法访问）

**前端部署到 Vercel：**

1. Fork 本项目或导入 `frontend/` 目录
2. Vercel 会自动识别 `api/[...path].js` 作为 Serverless Function
3. 修改 `api/[...path].js` 中的 `BACKEND_URL` 为你的 HF Space 地址
4. 或在 Vercel 项目设置中添加环境变量 `BACKEND_URL`
5. （可选）在 Vercel 项目设置中绑定自定义域名

**常见问题：**

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 所有请求返回 404 | HF Space README 缺少 `app_port` | 添加 `app_port: 7860` |
| 所有请求返回 404 | HF Space 是私有的 | 设置为 Public |
| POST 请求返回 405 | Vercel rewrites 不支持 POST | 使用 Serverless Function 代理 |

**HF Space 保活（防止休眠）：**

免费的 HF Space 会在 48 小时无活动后自动休眠。可使用 [UptimeRobot](https://uptimerobot.com/) 免费保活：

1. 注册 UptimeRobot 账号
2. 添加新监控：
   - Monitor Type: `HTTP(s)`
   - URL: `https://你的用户名-你的space名.hf.space/`
   - Monitoring Interval: `24 hours`（每天一次，足够防止休眠）
3. 保存即可

> 注意：免费版 UptimeRobot 最短间隔为 5 分钟，但对于防止 HF Space 休眠，每天一次已足够。

### 更新

**Linux/macOS:**
```bash
bash update.sh
```

**Windows:**
```cmd
update.bat
```

**HuggingFace:**
```
暂时只能重新部署更新，记得保存数据，建议用 PostgreSQL
```

更新脚本会自动备份配置、拉取最新代码、更新依赖并构建前端。

### 数据库持久化（可选）

> ⚠️ **HF Spaces 强烈建议开启**：免费 Space 重启后本地文件会丢失，数据库可确保配置持久化

**启用步骤：**
1. 取消 `requirements.txt` 中 `asyncpg` 的注释
2. 安装依赖：`pip install asyncpg`
3. 配置 `DATABASE_URL` 环境变量（获取方式见下方）
   - 本地开发：写入 `.env` 文件
   - HF Spaces：Settings → Variables and secrets（类型选 Secret）

**免费 PostgreSQL 数据库获取：**

<details>
<summary><b>方式 A：Neon（推荐，免费额度充足）</b></summary>

1. 访问 [neon.tech](https://neon.tech) 并注册/登录
2. 点击 **Create project**，输入项目名称，选择就近区域（如 Singapore）
3. 创建完成后，在 Dashboard 找到 **Connection string**
4. 点击复制，格式如下：
   ```
   postgresql://username:password@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ```
5. 将此连接串设置为 `DATABASE_URL` 环境变量

> 💡 Neon 免费版提供 0.5GB 存储 + 190 小时/月计算时间，个人使用完全够用

</details>

<details>
<summary><b>方式 B：Supabase（备选）</b></summary>

1. 访问 [supabase.com](https://supabase.com) 并注册/登录
2. 点击 **New project**，填写项目信息，设置数据库密码（务必记住）
3. 等待项目初始化完成（约 2 分钟）
4. 进入 **Project Settings → Database**
5. 在 **Connection string** 区域选择 **URI**，复制连接串
6. 将 `[YOUR-PASSWORD]` 替换为你设置的数据库密码：
   ```
   postgresql://postgres.xxx:你的密码@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
7. 将此连接串设置为 `DATABASE_URL` 环境变量

> 💡 Supabase 免费版提供 500MB 存储 + 2 个项目

</details>

> 🔒 **安全提示**：连接串包含数据库密码，请勿公开或提交到代码仓库

### 访问方式

- 管理面板：`http://localhost:7860/`（使用 `ADMIN_KEY` 登录）
- OpenAI 兼容接口：`http://localhost:7860/v1/chat/completions`

### 配置提示

- 账号配置优先读取 `ACCOUNTS_CONFIG`，也可在管理面板中录入并保存至 `data/accounts.json`。
- 如需鉴权，可设置 `API_KEY` 保护 `/v1/chat/completions`。

### 更多文档

- 支持的文件类型：[docs/SUPPORTED_FILE_TYPES.md](docs/SUPPORTED_FILE_TYPES.md)

## 📸 功能展示

### 管理系统

<table>
  <tr>
    <td><img src="docs/1.png" alt="管理系统 1" /></td>
    <td><img src="docs/2.png" alt="管理系统 2" /></td>
  </tr>
  <tr>
    <td><img src="docs/3.png" alt="管理系统 3" /></td>
    <td><img src="docs/4.png" alt="管理系统 4" /></td>
  </tr>
  <tr>
    <td><img src="docs/5.png" alt="管理系统 5" /></td>
    <td><img src="docs/6.png" alt="管理系统 6" /></td>
  </tr>
</table>

### 图片效果

<table>
  <tr>
    <td><img src="docs/img_1.png" alt="图片效果 1" /></td>
    <td><img src="docs/img_2.png" alt="图片效果 2" /></td>
  </tr>
  <tr>
    <td><img src="docs/img_3.png" alt="图片效果 3" /></td>
    <td><img src="docs/img_4.png" alt="图片效果 4" /></td>
  </tr>
</table>

## 🙏 致谢

* 源项目：[F佬 Linux.do 讨论](https://linux.do/t/topic/1225645)
* 源项目：[heixxin/gemini](https://huggingface.co/spaces/heixxin/gemini/tree/main) | [Linux.do 讨论](https://linux.do/t/topic/1226413)
* 绘图参考：[Gemini-Link-System](https://github.com/qxd-ljy/Gemini-Link-System) | [Linux.do 讨论](https://linux.do/t/topic/1234363)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Dreamy-rain/gemini-business2api&type=date&legend=top-left)](https://www.star-history.com/#Dreamy-rain/gemini-business2api&type=date&legend=top-left)

**如果这个项目对你有帮助，请给个 ⭐ Star!**



