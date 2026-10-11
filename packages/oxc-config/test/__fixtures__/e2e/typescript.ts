import { format } from "node:path";
import { readFile } from "node:fs/promises";

type User = {
  id: string;
  name: string;
}

var user: User = {
  id: "1",
  name: "Alice",
};

export type { User }
export { user }
