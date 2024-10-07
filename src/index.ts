import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";

import { AppConfig } from "./config";
import { routes } from "./routes";

AppConfig();
new Elysia()
  .use(
    logger({
      mode: "live",
    })
  )
  .use(routes)
  .listen(3000);

console.log(`Elysia is running at localhost:3000`);
