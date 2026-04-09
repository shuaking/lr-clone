#!/bin/bash
# GitHub 部署脚本
# 使用方法: 将下面的 YOUR_USERNAME 替换为你的 GitHub 用户名，然后运行此脚本

# ⚠️ 重要：替换为你的 GitHub 用户名
GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="lr-clone"

echo "🚀 开始推送到 GitHub..."
echo ""

# 检查是否已设置用户名
if [ "$GITHUB_USERNAME" = "YOUR_USERNAME" ]; then
  echo "❌ 错误：请先编辑此脚本，将 YOUR_USERNAME 替换为你的 GitHub 用户名"
  exit 1
fi

# 添加远程仓库
echo "📡 添加远程仓库..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 检查是否成功
if [ $? -ne 0 ]; then
  echo "⚠️  远程仓库已存在，尝试更新 URL..."
  git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
fi

# 重命名分支为 main（GitHub 默认）
echo "🔄 重命名分支为 main..."
git branch -M main

# 推送代码
echo "⬆️  推送代码到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 成功！你的代码已推送到："
  echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
  echo ""
  echo "🎯 下一步："
  echo "   1. 访问 https://vercel.com/new"
  echo "   2. 导入你的 GitHub 仓库"
  echo "   3. 点击 Deploy"
else
  echo ""
  echo "❌ 推送失败，可能的原因："
  echo "   1. GitHub 仓库不存在 - 请先在 https://github.com/new 创建"
  echo "   2. 没有权限 - 检查 GitHub 登录状态"
  echo "   3. 网络问题 - 检查网络连接"
fi
