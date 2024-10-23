//Create React App (CRA) 환경에서 프록시 설정을 하기 위한 http-proxy-middleware 라이브러리를 사용하여 작성된 프록시 미들웨어 설정입니다. 이를 통해 개발 환경에서 클라이언트(React 앱)와 서버 간의 API 호출을 원활하게 처리
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "localhost",
      //target: "http://localhost:3001",
      changeOrigin: true,
    })
  );
};
