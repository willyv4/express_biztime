process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");

describe("POST /industries", () => {
  afterEach(async () => {
    await db.query("DELETE FROM industries");
  });
  test("should create a new industry and return it in JSON format", async () => {
    const response = await request(app)
      .post("/industries")
      .send({ code: "hr", field: "human recources" });

    console.log(response);
    expect(response.statusCode).toBe(201);
    expect(response.body.code).toBe("hr");
    expect(response.body.field).toBe("human recources");
  });

  test("should return an error if code or field is missing", async () => {
    const response = await request(app).post("/industries").send({});
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});

describe("GET /industries", () => {
  beforeEach(async () => {
    // create an industry before each test
    industry = await db.query(`
      INSERT INTO industries (code, field)
      VALUES ('tech', 'Technology')
      RETURNING *
    `);
  });

  afterEach(async () => {
    // delete the industry after each test
    await db.query(`DELETE FROM industries WHERE code = 'tech'`);
  });

  test("should return all industries with their associated companies in an array", async () => {
    const response = await request(app).get("/industries");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("code");
    expect(response.body[0]).toHaveProperty("field");
    expect(response.body[0]).toHaveProperty("companies");
  });
});

describe("POST /industries/:code", () => {
  beforeEach(async () => {
    // create an industry before each test
    industry = await db.query(`
      INSERT INTO industries (code, field)
      VALUES ('tech', 'Technology')
      RETURNING *
    `);
  });

  afterEach(async () => {
    // delete the industry after each test
    await db.query(`DELETE FROM industries WHERE code = 'tech'`);
  });
  test("should associate an industry to a company and return the association in JSON format", async () => {
    const response = await request(app)
      .post(`/industries/apple`)
      .send({ ind_code: "tech" });

    expect(response.statusCode).toBe(201);
    expect(response.body.comp_code).toBe("apple");
    expect(response.body.ind_code).toBe("tech");
  });

  test("should return an error if the company or industry does not exist", async () => {
    const response = await request(app)
      .post(`/industries/invalidcode`)
      .send({ ind_code: "invalidcode" });

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
