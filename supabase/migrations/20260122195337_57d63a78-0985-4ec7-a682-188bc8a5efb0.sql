-- Create a products table (the "visible" table for searching)
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL
);

-- Create the hidden flags table (what players need to discover via SQLi)
CREATE TABLE public.flags (
  id SERIAL PRIMARY KEY,
  flag_value TEXT NOT NULL,
  hint TEXT
);

-- Insert some sample products
INSERT INTO public.products (name, description, price, category) VALUES
('Tropico', 'Bnin w bkolou vitamine', 1.2, 'Tropico'),
('Soufflet', 'Hrissa bel khobz', 2, 'Soufflet'),
('Prince', 'Choklata', 0.9, 'Prince'),
('Capucin', 'Me bel kahwa', 1.2, 'Capucin'),
('Eau', 'CyberQuest{m1yb2_f1k2_0r_m1yb2_n0t}', 0, 'Eau');


-- Insert the flag (what players need to find)
INSERT INTO public.flags (flag_value, hint) VALUES
('CyberQuest{un10n_1nj3ct10n_m4st3r}', 'Hidden in plain sight...');

-- IMPORTANT: No RLS on these tables - they're accessed via edge function only
-- The vulnerability is intentional for the CTF challenge