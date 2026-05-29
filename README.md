# 古建筑智慧消防与电气安全监测系统网站

这是“古建筑智慧消防与电气安全监测系统”的静态展示网站和监控台原型，包含项目介绍、实时监测面板、硬件层、平台层、App 层和专利切入点。

## 文件结构

```text
.
├── index.html
├── styles.css
├── app.js
├── assets/
│   └── images/
│       └── ancient-fire-hero.png
├── _headers
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

## 本地预览

直接双击 `index.html` 可以打开。也可以运行本地服务：

```powershell
python -m http.server 8088 --bind 127.0.0.1
```

然后访问：

```text
http://127.0.0.1:8088/index.html
```

## 后端连接

项目已经包含后端接口原型，支持硬件通过 HTTP POST 上传传感器数据，网页通过 API 和 SSE 实时刷新。

当前云服务器演示地址：

```text
http://81.70.232.233:3000
```

启动 Python 后端：

```powershell
python backend/server.py
```

打开：

```text
http://127.0.0.1:3000
```

硬件上报接口：

```text
POST http://电脑局域网IP:3000/api/sensor-data
```

接口说明和 ESP32 示例见 `HARDWARE_API.md`。

## 推荐部署

推荐使用 Cloudflare Pages：

- 项目类型：静态网站
- 构建命令：留空
- 输出目录：`/`
- 部署目录：本项目根目录

上线后可以先使用 `*.pages.dev` 免费公网网址，再绑定正式域名。
