// regenerator runtime will help run async code
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const regeneratorRuntime = "regenerator-runtime";
import server from "./src/server/server";

export default () => {
  global.testServer = server;
};
