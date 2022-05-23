const request = require("supertest");
const app = require("./app");

describe("GET / ", () => {
  // GET ALL TACHES TEST
  test("It should respond with an array of taches", async () => {
    const response = await request(app).get("/taches");
    expect(response.statusCode).toBe(200);
  });
  // GET ONE TACHE TEST
  test("It shoud get a specific tache", async () => {
    const response = await request(app).get("/taches/1");
    expect(response.statusCode).toBe(200);
  })
  
});
