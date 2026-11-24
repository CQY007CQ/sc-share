# 贡献指南

## 基本流程

1. 先创建或认领 Issue，明确目标和验收标准。
2. Fork 仓库或创建功能分支，不直接向 `master` 推送。
3. 每个 Pull Request 只解决一个问题。
4. 新功能必须包含测试；行为变化必须更新文档。
5. 提交前运行 `pytest` 和 `ruff check .`。

## 分支命名

- `feat/...`：新功能
- `fix/...`：错误修复
- `docs/...`：文档
- `test/...`：测试
- `refactor/...`：重构

## 提交信息

采用简洁的约定式提交：

```text
feat(search): add BFS implementation
fix(graph): reject invalid relationship type
docs: improve Windows setup guide
test(astar): cover unreachable target
```

## 代码要求

- Python 3.10 及以上。
- 公共函数应有类型标注和简短文档字符串。
- 不提交密码、Token、个人数据、数据库文件和大型安装包。
- 不伪造运行结果、贡献者或提交记录。
- 数据集必须注明来源和许可；不确定时先开 Issue 讨论。

## 评审标准

- 功能正确且能复现。
- 代码边界清晰，没有无关改动。
- 测试覆盖关键路径和失败场景。
- 文档能让低年级同学独立运行。
- 讨论技术取舍，而不只是粘贴代码。

