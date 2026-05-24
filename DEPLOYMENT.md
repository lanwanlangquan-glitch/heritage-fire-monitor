# 上线部署说明

## 方案一：Cloudflare Pages 直接上传

这是最简单的方式，不需要安装 Git。

1. 打开 Cloudflare 控制台。
2. 进入 `Workers & Pages`。
3. 选择 `Create application`。
4. 选择 `Pages`。
5. 选择 `Upload assets` 或 `Direct Upload`。
6. 上传本项目生成的 `heritage-fire-site.zip`。
7. 项目名称建议填写：

```text
heritage-fire-monitor
```

8. 部署成功后会得到类似这样的公网地址：

```text
https://heritage-fire-monitor.pages.dev
```

## 方案二：GitHub + Cloudflare Pages

后续如果安装了 Git，可以把本项目推到 GitHub，再让 Cloudflare Pages 自动部署。

Cloudflare Pages 设置：

```text
Framework preset: None
Build command: 留空
Build output directory: /
```

## 绑定正式域名

域名示例：

```text
gujiananlan.cn
heritagefire.cn
gujian-fire.cn
zhaoyuhui-fire.cn
```

在 Cloudflare Pages 的 `Custom domains` 里添加域名。常见 DNS 记录：

```text
类型: CNAME
名称: www
目标: heritage-fire-monitor.pages.dev
```

如果绑定根域名，例如 `gujiananlan.cn`，Cloudflare 会提示需要添加根域名解析记录，按页面提示操作即可。

## 国内访问提醒

如果使用 `.cn` 域名并希望放在国内云服务器，通常需要备案。大创展示阶段建议先用 Cloudflare Pages 免费网址，后续项目名称确定后再购买正式域名。

