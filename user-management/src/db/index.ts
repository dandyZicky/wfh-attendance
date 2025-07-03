import { createPool, Pool } from "mysql2/promise";
import { cfg } from "./config.js";

export const userManagementDB: Pool = createPool(cfg);