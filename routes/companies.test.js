process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");

// Drop and reseed the test database before each test.
beforeEach(async () => {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");
  await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES
      ('apple', 'Apple', 'Maker of the iPhone'),
      ('google', 'Google', 'Search engine and more')
  `);

  await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
    VALUES
      ('apple', 100, false, '2023-01-01', null),
      ('apple', 200, true, '2023-02-01', '2023-02-15'),
      ('google', 300, false, '2023-03-01', null)
  `);
});

describe("GET /", () => {
  test("responds with JSON containing all companies", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("companies");
    expect(res.body).toEqual({
      companies: [
        {
          code: "apple",
          name: "Apple",
          description: "Maker of the iPhone",
        },
        {
          code: "google",
          name: "Google",
          description: "Search engine and more",
        },
      ],
    });
  });
});

describe("POST /", () => {
  test("creates a new company", async () => {
    const company = {
      name: "Test Company",
      description: "This is a test company",
    };
    const response = await request(app).post("/companies").send(company);

    expect(response.body.company).toHaveProperty("code");
    expect(response.body.company).toHaveProperty("name", company.name);
    expect(response.body.company).toHaveProperty(
      "description",
      company.description
    );
  });
});

describe("PUT /:code", () => {
  test("updates a company and returns the updated data", async () => {
    const response = await request(app)
      .put("/companies/google")
      .send({ name: "Updated Company", description: "Updated description" });

    expect(response.body).toEqual({
      company: {
        code: "google",
        name: "Updated Company",
        description: "Updated description",
      },
    });
  });

  test("returns 404 if company code does not exist", async () => {
    const response = await request(app)
      .put("/companies/invalid")
      .send({ name: "Updated Company", description: "Updated description" });

    expect(response.body).toEqual({
      error: {
        message: "Can't update company with code of invalid",
        status: 404,
      },
      message: "Can't update company with code of invalid",
    });
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes a company", async () => {
    const response = await request(app).delete("/companies/google");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "DELETED!" });

    // Verify that the company is actually deleted from the database
    const deletedCompany = await db.query(
      "SELECT * FROM companies WHERE code = 'google'"
    );
    expect(deletedCompany.rows.length).toBe(0);
  });

  test("Responds with 404 for invalid code", async () => {
    const response = await request(app).delete("/companies/invalid");
    expect(response.status).toBe(404);
  });
});
