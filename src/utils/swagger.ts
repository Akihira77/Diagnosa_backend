import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Disease Diagnose Backend API",
      version: "1.0.0",
      description: "API documentation for the Disease Diagnose application.",
    },
  },
  apis: ["./src/routes/*.ts", "./src/routes/*.js"], // Daftar file yang berisi definisi rute Anda
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
