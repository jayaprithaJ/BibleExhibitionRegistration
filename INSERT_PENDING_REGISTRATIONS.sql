-- Insert Pending Registrations for Sunday, June 22, 2026
-- These registrations are not checked in yet (pending status)

-- Pentecost Church registrations (50 people across 10 registrations)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people, 
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
VALUES
  ('BE-2001', 'John Michael', 'Pentecost Church', '2026-06-22', 5, 3, 2, '+919876543210', 'john.michael@pentecost.com', md5(random()::text), 'adventist', false, NOW() - INTERVAL '2 days'),
  ('BE-2002', 'Sarah Williams', 'Pentecost Church', '2026-06-22', 4, 2, 2, '+919876543211', 'sarah.w@pentecost.com', md5(random()::text), 'adventist', false, NOW() - INTERVAL '2 days'),
  ('BE-2003', 'David Kumar', 'Pentecost Church', '2026-06-22', 6, 4, 2, '+919876543212', 'david.k@pentecost.com', md5(random()::text), 'adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2004', 'Mary Joseph', 'Pentecost Church', '2026-06-22', 3, 2, 1, '+919876543213', 'mary.j@pentecost.com', md5(random()::text), 'adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2005', 'Thomas Raj', 'Pentecost Church', '2026-06-22', 7, 4, 3, '+919876543214', 'thomas.r@pentecost.com', md5(random()::text), 'adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2006', 'Elizabeth Paul', 'Pentecost Church', '2026-06-22', 5, 3, 2, '+919876543215', 'elizabeth.p@pentecost.com', md5(random()::text), 'adventist', false, NOW()),
  ('BE-2007', 'James Peter', 'Pentecost Church', '2026-06-22', 4, 2, 2, '+919876543216', 'james.p@pentecost.com', md5(random()::text), 'adventist', false, NOW()),
  ('BE-2008', 'Ruth Samuel', 'Pentecost Church', '2026-06-22', 6, 3, 3, '+919876543217', 'ruth.s@pentecost.com', md5(random()::text), 'adventist', false, NOW()),
  ('BE-2009', 'Daniel Moses', 'Pentecost Church', '2026-06-22', 5, 3, 2, '+919876543218', 'daniel.m@pentecost.com', md5(random()::text), 'adventist', false, NOW()),
  ('BE-2010', 'Grace Matthew', 'Pentecost Church', '2026-06-22', 5, 2, 3, '+919876543219', 'grace.m@pentecost.com', md5(random()::text), 'adventist', false, NOW());

-- St. Ignatius Church registrations (40 people across 8 registrations)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people, 
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
VALUES
  ('BE-2011', 'Francis Xavier', 'St. Ignatius Church', '2026-06-22', 6, 3, 3, '+919876543220', 'francis.x@stignatius.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '3 days'),
  ('BE-2012', 'Maria Fernandes', 'St. Ignatius Church', '2026-06-22', 5, 3, 2, '+919876543221', 'maria.f@stignatius.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '2 days'),
  ('BE-2013', 'Anthony DSouza', 'St. Ignatius Church', '2026-06-22', 4, 2, 2, '+919876543222', 'anthony.d@stignatius.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '2 days'),
  ('BE-2014', 'Teresa Rodrigues', 'St. Ignatius Church', '2026-06-22', 5, 2, 3, '+919876543223', 'teresa.r@stignatius.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2015', 'Sebastian Lobo', 'St. Ignatius Church', '2026-06-22', 6, 4, 2, '+919876543224', 'sebastian.l@stignatius.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2016', 'Catherine Pinto', 'St. Ignatius Church', '2026-06-22', 4, 2, 2, '+919876543225', 'catherine.p@stignatius.com', md5(random()::text), 'non_adventist', false, NOW()),
  ('BE-2017', 'Joseph Almeida', 'St. Ignatius Church', '2026-06-22', 5, 3, 2, '+919876543226', 'joseph.a@stignatius.com', md5(random()::text), 'non_adventist', false, NOW()),
  ('BE-2018', 'Agnes Pereira', 'St. Ignatius Church', '2026-06-22', 5, 2, 3, '+919876543227', 'agnes.p@stignatius.com', md5(random()::text), 'non_adventist', false, NOW());

-- St. Jude Church registrations (35 people across 7 registrations)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people, 
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
VALUES
  ('BE-2019', 'Patrick George', 'St. Jude Church', '2026-06-22', 5, 3, 2, '+919876543228', 'patrick.g@stjude.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '2 days'),
  ('BE-2020', 'Monica Dias', 'St. Jude Church', '2026-06-22', 6, 3, 3, '+919876543229', 'monica.d@stjude.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '2 days'),
  ('BE-2021', 'Vincent Gomes', 'St. Jude Church', '2026-06-22', 4, 2, 2, '+919876543230', 'vincent.g@stjude.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2022', 'Cecilia Mendes', 'St. Jude Church', '2026-06-22', 5, 2, 3, '+919876543231', 'cecilia.m@stjude.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2023', 'Lawrence Sequeira', 'St. Jude Church', '2026-06-22', 5, 3, 2, '+919876543232', 'lawrence.s@stjude.com', md5(random()::text), 'non_adventist', false, NOW()),
  ('BE-2024', 'Rita Noronha', 'St. Jude Church', '2026-06-22', 5, 2, 3, '+919876543233', 'rita.n@stjude.com', md5(random()::text), 'non_adventist', false, NOW()),
  ('BE-2025', 'Bernard Furtado', 'St. Jude Church', '2026-06-22', 5, 3, 2, '+919876543234', 'bernard.f@stjude.com', md5(random()::text), 'non_adventist', false, NOW());

-- Holy Trinity Church registrations (30 people across 6 registrations)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people, 
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
VALUES
  ('BE-2026', 'Michael Fernandes', 'Holy Trinity Church', '2026-06-22', 5, 3, 2, '+919876543235', 'michael.f@trinity.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '2 days'),
  ('BE-2027', 'Angela DCosta', 'Holy Trinity Church', '2026-06-22', 5, 2, 3, '+919876543236', 'angela.d@trinity.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2028', 'Peter Rodrigues', 'Holy Trinity Church', '2026-06-22', 5, 3, 2, '+919876543237', 'peter.r@trinity.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2029', 'Lucy Pinto', 'Holy Trinity Church', '2026-06-22', 5, 2, 3, '+919876543238', 'lucy.p@trinity.com', md5(random()::text), 'non_adventist', false, NOW()),
  ('BE-2030', 'Andrew Lobo', 'Holy Trinity Church', '2026-06-22', 5, 3, 2, '+919876543239', 'andrew.l@trinity.com', md5(random()::text), 'non_adventist', false, NOW()),
  ('BE-2031', 'Helen Almeida', 'Holy Trinity Church', '2026-06-22', 5, 2, 3, '+919876543240', 'helen.a@trinity.com', md5(random()::text), 'non_adventist', false, NOW());

-- St. Mary's Cathedral registrations (25 people across 5 registrations)
INSERT INTO registrations (
  registration_number, name, church_name, preferred_date, total_people, 
  tamil_count, english_count, phone, email, qr_token, visitor_type, checked_in, created_at
)
VALUES
  ('BE-2032', 'George Thomas', 'St. Mary''s Cathedral', '2026-06-22', 5, 3, 2, '+919876543241', 'george.t@stmarys.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2033', 'Anne Mathew', 'St. Mary''s Cathedral', '2026-06-22', 5, 2, 3, '+919876543242', 'anne.m@stmarys.com', md5(random()::text), 'non_adventist', false, NOW() - INTERVAL '1 day'),
  ('BE-2034', 'Paul Jacob', 'St. Mary''s Cathedral', '2026-06-22', 5, 3, 2, '+919876543243', 'paul.j@stmarys.com', md5(random()::text), 'non_adventist', false, NOW()),
  ('BE-2035', 'Martha John', 'St. Mary''s Cathedral', '2026-06-22', 5, 2, 3, '+919876543244', 'martha.j@stmarys.com', md5(random()::text), 'non_adventist', false, NOW()),
  ('BE-2036', 'Simon Philip', 'St. Mary''s Cathedral', '2026-06-22', 5, 3, 2, '+919876543245', 'simon.p@stmarys.com', md5(random()::text), 'non_adventist', false, NOW());

-- Verify the insertions
SELECT 
  'Pending Registrations for Sunday, June 22, 2026' as summary,
  church_name,
  COUNT(*) as registration_count,
  SUM(total_people) as total_people,
  visitor_type
FROM registrations
WHERE preferred_date = '2026-06-22'
  AND checked_in = false
GROUP BY church_name, visitor_type
ORDER BY church_name;

-- Overall summary
SELECT 
  'Total Pending for June 22' as metric,
  COUNT(*) as registrations,
  SUM(total_people) as people
FROM registrations
WHERE preferred_date = '2026-06-22'
  AND checked_in = false;

-- Made with Bob
