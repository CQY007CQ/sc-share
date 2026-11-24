// 校园课程知识图谱：可直接粘贴到 Neo4j Browser 执行
MERGE (d:Department {name:'人工智能系'})
MERGE (t:Teacher {name:'张老师'})
MERGE (c1:Course {name:'人工智能基础', credits:3})
MERGE (c2:Course {name:'图数据库技术', credits:2})
MERGE (s1:Student {name:'李明', student_id:'2026001'})
MERGE (s2:Student {name:'王芳', student_id:'2026002'})
MERGE (d)-[:OFFERS]->(c1)
MERGE (d)-[:OFFERS]->(c2)
MERGE (t)-[:TEACHES]->(c1)
MERGE (t)-[:TEACHES]->(c2)
MERGE (s1)-[:SELECTS {score:88}]->(c1)
MERGE (s1)-[:SELECTS {score:91}]->(c2)
MERGE (s2)-[:SELECTS {score:94}]->(c1)
MERGE (c1)-[:PREREQUISITE_OF]->(c2);

