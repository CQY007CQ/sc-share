# 贡献指南

## 基本流程

1. 先创建或认领 Issue，明确目标和验收标准。
2. Fork 仓库或创建功能分支，不直接向 `master` 推送。
3. 每个 Pull Request 只解决一个问题。
4. 新功能必须包含测试；行为变化必须更新文档。
5. 提交前运行 `pytest` 和 `ruff check .`。

## 提交实验室项目

1. 团队项目放入 `projects/teams/<项目英文简称>/`。
2. 个人项目放入 `projects/individuals/<姓名拼音>-<项目英文简称>/`。
3. 从 `projects/_template/README.md` 复制项目说明模板并完整填写。
4. 在 `projects/PROJECTS.md` 增加一行项目接龙信息。
5. 一个 Pull Request 只提交一个项目，由组长或仓库维护者评审。

禁止把项目文件直接放在仓库根目录。项目如需独立依赖，应在自己的目录中提供 `requirements.txt`、`pyproject.toml` 或其他环境文件，不得修改公共项目依赖来迁就单个项目。

## 分支命名

- `feat/...`：新功能
- `fix/...`：错误修复
- `docs/...`：文档
- `test/...`：测试
- `refactor/...`：重构
- `project/team-...`：团队项目
- `project/personal-...`：个人项目

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
- 每个项目必须能独立阅读和运行，并说明负责人、成员与分工。
- 大型模型、数据集和运行结果不直接提交，改用下载链接并注明来源。

## 评审标准

- 功能正确且能复现。
- 代码边界清晰，没有无关改动。
- 测试覆盖关键路径和失败场景。
- 文档能让低年级同学独立运行。
- 讨论技术取舍，而不只是粘贴代码。

