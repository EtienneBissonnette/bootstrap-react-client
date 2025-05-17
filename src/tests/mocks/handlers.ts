import { authHandlers } from "./auth-handlers";
import { contactHandlers } from "./contact-handler";

export const handlers = [...authHandlers, ...contactHandlers];
