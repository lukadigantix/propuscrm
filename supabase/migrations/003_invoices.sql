-- invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id     uuid REFERENCES contacts(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  type           text NOT NULL CHECK (type IN ('Photos', 'Matterport', 'Subscription')),
  description    text,
  amount         numeric(12, 2) NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')),
  issue_date     date NOT NULL DEFAULT CURRENT_DATE,
  due_date       date NOT NULL,
  paid_date      date,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
