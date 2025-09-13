import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth({
  ...authOptions,
  debug: true,
  logger: {
    error(code, ...metadata) {
      console.error("[next-auth:error]", code, ...metadata);
    },
    warn(code, ...metadata) {
      console.warn("[next-auth:warn]", code, ...metadata);
    },
    debug(code, ...metadata) {
      console.log("[next-auth:debug]", code, ...metadata);
    },
  },
});
export { handler as GET, handler as POST };


