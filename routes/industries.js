const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// Route to add an industry
router.post("/", async (req, res, next) => {
  try {
    const { code, field } = req.body;
    const newIndustry = await db.query(
      "INSERT INTO industries (code, field) VALUES ($1, $2) RETURNING *",
      [code, field]
    );
    res.status(201).json(newIndustry.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Route to list all industries with associated company codes
router.get("/", async (req, res, next) => {
  try {
    const industries = await db.query(`
      SELECT i.code, i.field, array_agg(ci.comp_code) as companies
      FROM industries i
      LEFT JOIN company_industries ci ON i.code = ci.ind_code
      GROUP BY i.code, i.field
      ORDER BY i.code
    `);
    res.json(industries.rows);
  } catch (err) {
    next(err);
  }
});

// Route to associate an industry to a company
router.post("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { ind_code } = req.body;
    const newAssoc = await db.query(
      "INSERT INTO company_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING *",
      [code, ind_code]
    );
    res.status(201).json(newAssoc.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
