import express from "express";
import path from "path";
import { DefaultErr } from "../../types/types";
import { typeDefs } from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";
import PrometheusAPI from "./graphql/datasources/prometheusAPI";

// Default port as 3000 or PORT defined by a user in an env file.
const PORT: number | string = process.env.PORT || 3000;

// Initialize express server
const app: express.Express = express();

// Parse JSON and form data and pass it to req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all compiled files when using production build
app.use("/", express.static(path.resolve(__dirname, "../../public")));

async function startApolloServer(typeDefs, resolvers) {
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    dataSources: () => {
      return {
        prometheusAPI: new PrometheusAPI(),
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  // For dev only
  if (process.env.NODE_ENV === "development") {
    app.get("/*", (req: express.Request, res: express.Response) => {
      res.status(200).sendFile(path.resolve(__dirname, "../client/index.html"));
    });
  }

  // Set up 404s for invalid requests
  app.use("*", (req: express.Request, res: express.Response) => {
    res.status(404).send("There was nothing found at this route.");
  });

  // Global error handler
  app.use(
    (
      err: express.Errback,
      req: express.Request,
      res: express.Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,
      next: express.NextFunction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): express.Response<Record<string, any>> => {
      const defaultErr: DefaultErr = {
        log: "Express error handler caught unknown middleware error",
        status: 500,
        message: { err: "An error occurred" },
      };
      const errorObj: DefaultErr = Object.assign({}, defaultErr, err);
      console.log(errorObj.log);
      return res.status(errorObj.status).json(errorObj.message);
    }
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(
    `🚀 Server ready at PORT: ${PORT}. Graphql path at ${server.graphqlPath} 🎉!`
  );

  return server;
}

export default startApolloServer(typeDefs, resolvers);
