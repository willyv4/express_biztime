DROP TABLE IF EXISTS company_industries;

DROP TABLE IF EXISTS invoices;

DROP TABLE IF EXISTS companies;

DROP TABLE IF EXISTS industries;

CREATE TABLE companies(
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

CREATE TABLE invoices(
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  amt float NOT NULL,
  paid boolean DEFAULT FALSE NOT NULL,
  add_date date DEFAULT CURRENT_DATE NOT NULL,
  paid_date date,
  CONSTRAINT invoices_amt_check CHECK ((amt >(0)::double precision))
);

CREATE TABLE industries(
  code text PRIMARY KEY,
  field text NOT NULL
);

CREATE TABLE company_industries(
  comp_code text REFERENCES companies(code) ON DELETE CASCADE,
  ind_code text REFERENCES industries(code) ON DELETE CASCADE,
  PRIMARY KEY (comp_code, ind_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices(comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, FALSE, NULL),
('apple', 200, FALSE, NULL),
('apple', 300, TRUE, '2018-01-01'),
('ibm', 400, FALSE, NULL);

INSERT INTO industries
  VALUES ('tech', 'Technology'),
('fin', 'Finance'),
('hc', 'Healthcare');

INSERT INTO company_industries(comp_code, ind_code)
  VALUES ('apple', 'tech');

