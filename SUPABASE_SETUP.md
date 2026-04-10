# Supabase 设置指南

## 概述

本项目支持两种运行模式：

### 本地模式（默认）
- ✅ 无需任何配置即可使用
- ✅ 用户数据存储在浏览器 localStorage
- ✅ 支持注册、登录、词汇管理等所有核心功能
- ⚠️ 数据仅存储在本地，清除浏览器数据会丢失
- ⚠️ 无法跨设备同步

### Supabase 模式（可选）
- ✅ 数据存储在云端
- ✅ 支持跨设备同步
- ✅ 数据持久化，不会丢失
- ✅ 支持邮箱验证和密码重置
- ⚠️ 需要配置 Supabase 项目

---

## 何时需要 Supabase？

如果您满足以下任一条件，建议配置 Supabase：

- 需要在多个设备间同步学习数据
- 需要数据持久化保存（不依赖浏览器）
- 需要邮箱验证和密码重置功能
- 计划部署到生产环境供多人使用

如果只是个人学习或测试，本地模式已经足够。

---

## Supabase 配置步骤

### 步骤 1: 创建 Supabase 项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写信息：
   - **Name**: `lr-clone` 或 `language-reactor-clone`
   - **Database Password**: 生成强密码并保存
   - **Region**: 选择离你最近的区域（如 `Northeast Asia (Tokyo)`）
4. 点击 "Create new project"（等待 2-3 分钟）

---

### 步骤 2: 获取 API 密钥

1. 项目创建完成后，进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### 步骤 3: 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
```

⚠️ **重要**: 不要提交 `.env.local` 到 Git（已在 `.gitignore` 中）

---

### 步骤 4: 执行数据库迁移

1. 在 Supabase Dashboard，进入 **SQL Editor**
2. 点击 "New query"
3. 复制 `supabase/migrations/001_initial_schema.sql` 的内容
4. 粘贴并点击 "Run"
5. 重复步骤 2-4，执行 `002_rls_policies.sql`

---

### 步骤 5: 配置认证

1. 进入 **Authentication** → **Providers**
2. 启用 **Email** 认证
3. 配置邮件模板（可选）：
   - **Settings** → **Auth** → **Email Templates**
   - 自定义注册确认邮件

---

### 步骤 6: 测试连接

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 http://localhost:3000/login

3. 注册一个测试账号

4. 检查 Supabase Dashboard → **Authentication** → **Users**，应该能看到新用户

5. 保存一些词汇，刷新页面验证数据持久化

---

### 步骤 7: 本地数据迁移（可选）

如果您之前使用本地模式保存了数据，配置 Supabase 后可以迁移：

1. 登录 Supabase 账号
2. 访问 `/vocabulary` 页面
3. 如果检测到本地数据，会显示"数据迁移"提示
4. 点击"立即迁移"
5. 本地数据将同步到 Supabase

**注意**: 迁移后建议保留本地数据一段时间，确认云端数据正常后再清除。

---

### 步骤 8: Vercel 部署配置

在 Vercel Dashboard 添加环境变量：

1. 进入项目 → **Settings** → **Environment Variables**
2. 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 重新部署

---

## 验证清单

### 本地模式验证
- [ ] 可以访问 http://localhost:3000
- [ ] 可以注册新账号（数据保存到 localStorage）
- [ ] 可以登录已注册账号
- [ ] 可以访问受保护路由（/app, /vocabulary, /stats）
- [ ] 刷新页面后登录状态保持
- [ ] 词汇保存功能正常

### Supabase 模式验证
- [ ] Supabase 项目创建成功
- [ ] 数据库表创建成功（6 张表）
- [ ] RLS 策略启用
- [ ] 环境变量配置正确
- [ ] 本地可以注册/登录
- [ ] 词汇保存到云端
- [ ] 跨设备同步正常
- [ ] Vercel 生产环境配置完成

---

## 常见问题

### Q: 注册后收不到验证邮件？
A: 检查 Supabase Dashboard → **Authentication** → **Email Templates**，确认 SMTP 配置正确。开发环境可以在 **Authentication** → **Users** 手动确认邮箱。

### Q: RLS 策略导致查询失败？
A: 检查 SQL Editor 中是否有错误。确保 `auth.uid()` 函数可用。

### Q: 本地数据迁移失败？
A: 检查浏览器控制台错误。确认用户已登录且 Supabase 配置正确。

---

## 下一步

Phase 2 完成后，继续 Phase 3：
- 间隔重复算法（SRS）
- 词汇复习系统
- 导出到 Anki
