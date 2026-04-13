declare module "connect-timeout" {
  import { RequestHandler } from "express";
  function timeout(time: string | number): RequestHandler;
  export default timeout;
}
