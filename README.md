# SC Lab 人工智能基础实践平台

面向实验室大一、大二同学的开源实践仓库。项目从可运行的小实验出发，帮助参与者学习 Python、搜索算法、知识图谱、测试、Git 协作和代码评审。

## 已有模块

| 模块 | 内容 | 适合人群 |
| --- | --- | --- |
| 搜索算法 | A*、四/八邻域、曼哈顿/欧式/八方向启发式、运行统计 | Python 入门后 |
| 知识图谱 | Neo4j 数据导入、唯一约束、批量事务、Cypher 查询 | 数据库入门后 |
| 工程实践 | pytest、类型标注、命令行工具、贡献流程 | 所有参与者 |

## 快速开始

```bash
git clone https://gitee.com/life-is-a-wilderness/sc-share.git
cd sc-lab
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
pytest
```

运行 A* 示例：

```bash
sc-lab astar --width 20 --height 20 --blocks 50 --neighbors 4 --seed 20261122
```

运行知识图谱导入：

```bash
pip install -e .[neo4j]
set NEO4J_PASSWORD=你的密码
sc-lab knowledge-graph --csv data/honglou_sample.csv
```

## 项目结构

```text
sc-lab/
├─ src/sc_lab/          核心代码
├─ tests/               自动测试
├─ examples/            可直接运行的示例
├─ data/                小规模公开示例数据
├─ docs/                教程、路线图和新人任务
└─ .gitee/              Issue 与 Pull Request 模板
```

## 参与方式

1. 阅读 [贡献指南](CONTRIBUTING.md) 和 [新人任务](docs/starter-tasks.md)。
2. 在 Gitee Issue 中认领任务，不重复开发。
3. 从 `develop` 创建分支，例如 `feat/bfs-search`。
4. 完成代码、测试和文档后提交 Pull Request。
5. 根据评审意见修改，由维护者合并。

建议第一次贡献从 `good-first-issue` 标签开始。项目不要求一次提交很多代码，但要求每次改动可运行、可解释、可复查。

## 路线图

- [x] A* 搜索与参数统计
- [x] Neo4j 知识图谱导入
- [ ] BFS、DFS、Dijkstra 对比
- [ ] 搜索过程动态可视化
- [ ] 图谱实体消歧与数据校验
- [ ] PageRank 与社区发现
- [ ] 简单 Web 实验界面

## 开源协议

本项目采用 [MIT License](LICENSE)。提交代码即表示同意以该协议发布贡献。

## 维护者

- 发起人：[@life-is-a-wilderness](https://gitee.com/life-is-a-wilderness)

