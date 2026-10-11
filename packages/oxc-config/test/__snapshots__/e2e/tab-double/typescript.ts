import { readFile } from "node:fs/promises";
import { format } from "node:path";

interface User {
	id: string;
	name: string;
}

const user: User = {
	id: "1",
	name: "Alice",
};

export type { User };
export { user };
