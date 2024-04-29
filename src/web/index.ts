import app from "./app";

const createServer = () => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
  });
};

export default createServer;
