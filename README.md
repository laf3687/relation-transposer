# Luke's Relational Transposer

This is a tool I made that can automatically transpose relations given the cardinalities.

I find this very useful for database design and transferring E-R Diagrams into transposed relations and/or SQL CREATE TABLE queries.

To try the tool out, pass one of the example JSON files in this repository as a parameter when running this program.

```
node transposer_with_sql.ts json/relation.json 
```

Note: This tool cannot transpose relations perfectly (especially with complex diagrams and circular dependencies), and it is recommended to manually check the outputs of this tool whenever possible.
