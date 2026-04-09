# ============================================
# GitHub 推送命令 - 复制粘贴执行
# ============================================

# 1️⃣ 替换下面的 YOUR_USERNAME 为你的 GitHub 用户名
$GITHUB_USERNAME = "YOUR_USERNAME"

# 2️⃣ 进入项目目录
cd "D:\code\languagereactor.com\lr-clone"

# 3️⃣ 添加远程仓库
git remote add origin "https://github.com/$GITHUB_USERNAME/lr-clone.git"

# 如果提示 "remote origin already exists"，运行这个：
# git remote set-url origin "https://github.com/$GITHUB_USERNAME/lr-clone.git"

# 4️⃣ 重命名分支为 main
git branch -M main

# 5️⃣ 推送代码
git push -u origin main

# ============================================
# 完成后访问：
# https://github.com/$GITHUB_USERNAME/lr-clone
# ============================================
