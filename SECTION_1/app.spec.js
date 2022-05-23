const request = require("supertest");
const app = require("./app");

describe("GET / ", () => {

  test("It should respond with an array of taches", async () => {
    const response = await request(app).get("/taches");
    expect(response.statusCode).toBe(200);
  });
  
});
