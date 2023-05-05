process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");

describe("GET /invoices", () => {
  test("should return an array of invoices in JSON format", async () => {
    const response = await request(app).get("/invoices");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("invoices");
    expect(Array.isArray(response.body.invoices)).toBe(true);
  });
});

test("GET /invoices/:id - should return an invoice with given id", async () => {
  const invoice = await db.query("SELECT * FROM invoices LIMIT 1");
  const id = invoice.rows[0].id;

  const response = await request(app).get(`/invoices/${id}`);

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("user");
  expect(response.body.user).toHaveProperty("id", id);
});

test("GET /invoices/:id - should return 404 error for non-existent invoice id", async () => {
  const response = await request(app).get("/invoices/9999");

  expect(response.statusCode).toBe(404);
  console.log(response.body);
  expect(response.body).toEqual({
    error: { message: "Can't find invoices with id of 9999", status: 404 },
    message: "Can't find invoices with id of 9999",
  });
});

describe("POST /invoices", () => {
  test("creates a new invoice and returns the invoice data in JSON format", async () => {
    const newInvoice = {
      comp_code: "apple",
      amt: 100,
    };
    const response = await request(app).post("/invoices").send(newInvoice);

    expect(response.statusCode).toBe(201);
    expect(response.body.invoice.comp_code).toBe(newInvoice.comp_code);
    expect(response.body.invoice.amt).toBe(newInvoice.amt);
    expect(response.body.invoice).toHaveProperty("id");
  });

  test("returns an error if the required data is missing", async () => {
    const invalidInvoice = {
      comp_code: "apple",
    };
    const response = await request(app).post("/invoices").send(invalidInvoice);

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});

test("PUT /invoices/:id - should update an invoice and return the updated invoice in JSON format", async () => {
  const newInvoice = {
    comp_code: "apple",
    amt: 100,
  };

  const createdInvoiceResponse = await request(app)
    .post("/invoices")
    .send(newInvoice);

  const { invoice } = createdInvoiceResponse.body;

  const updatedInvoice = {
    amt: 200,
    paid: true,
  };

  const updatedInvoiceResponse = await request(app)
    .put(`/invoices/${invoice.id}`)
    .send(updatedInvoice);

  expect(updatedInvoiceResponse.statusCode).toBe(200);
  expect(updatedInvoiceResponse.body).toEqual({
    invoice: {
      id: invoice.id,
      comp_code: invoice.comp_code,
      amt: updatedInvoice.amt,
      paid: updatedInvoice.paid,
      add_date: expect.any(String),
      paid_date: expect.any(String),
    },
  });
});

test("DELETE /invoices/:id - deletes an invoice", async () => {
  // First, create an invoice
  const newInvoice = {
    comp_code: "apple",
    amt: 100,
  };
  const response = await request(app).post("/invoices").send(newInvoice);

  expect(response.statusCode).toBe(201);

  const id = response.body.invoice.id;
  // Then, delete the invoice
  const deleteRes = await request(app).delete(`/invoices/${id}`);

  // Expect the response status to be 200 OK
  expect(deleteRes.statusCode).toBe(200);
  expect(deleteRes.body).toEqual({ status: "DELETED!" });

  // Then, try to fetch the deleted invoice to make sure it doesn't exist anymore
  const getRes = await request(app).get(`/invoices/${id}`);

  // Expect the response status to be 404 Not Found
  expect(getRes.statusCode).toBe(404);
  expect(getRes.body).toHaveProperty("error");
});
