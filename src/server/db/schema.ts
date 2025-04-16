import { int, bigint, text, singlestoreTable } from "drizzle-orm/singlestore-core";

export const users = singlestoreTable("flexweb_users", {
  id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
  name: text("name"),
  age: int("age"),
});