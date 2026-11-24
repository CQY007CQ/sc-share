# 新人上手

## 第一天

1. 安装 Git 和 Python 3.10 以上版本。
2. Fork 仓库并克隆自己的 Fork。
3. 创建虚拟环境，执行 `pip install -e .[dev]`。
4. 运行 `pytest`，确认测试全部通过。
5. 在 Issue 中留言认领一个 `good-first-issue`。

## 第一次 Pull Request

```bash
git switch -c docs/your-topic
git add .
git commit -m "docs: improve setup notes"
git push origin docs/your-topic
```

然后在 Gitee 创建 Pull Request。描述中说明：解决什么问题、如何验证、是否影响兼容性。

## 遇到问题时

提问应包含运行命令、完整错误信息、Python 版本和操作系统。不要只发“运行不了”。

