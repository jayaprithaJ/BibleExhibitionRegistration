-- Update generic "Member XXXX" names with realistic Indian and Christian names
-- This will give the database more realistic sample data

-- Create a temporary table with random names
CREATE TEMP TABLE temp_names AS
SELECT
  id,
  (ARRAY[
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vijay Singh',
    'Anita Desai', 'Suresh Kumar', 'Kavita Sharma', 'Ramesh Gupta', 'Deepa Rao',
    'Arun Kumar', 'Lakshmi Rao', 'Karthik Krishnan', 'Meera Reddy', 'Sanjay Verma',
    'Pooja Joshi', 'Ravi Shankar', 'Divya Kumar', 'Manoj Kumar', 'Swati Agarwal',
    'John Thomas', 'Mary Joseph', 'David Samuel', 'Sarah Abraham', 'James Paul',
    'Elizabeth George', 'Michael Francis', 'Grace Peter', 'Joseph Mathew', 'Anna John',
    'Daniel David', 'Rebecca Thomas', 'Samuel Joseph', 'Ruth Abraham', 'Benjamin Paul',
    'Esther George', 'Joshua Francis', 'Hannah Peter', 'Stephen Mathew', 'Martha John',
    'Thomas David', 'Lydia Samuel', 'Philip Joseph', 'Deborah Abraham', 'Andrew Paul',
    'Rachel George', 'Matthew Francis', 'Miriam Peter', 'Simon Mathew', 'Priscilla John',
    'Arjun Kumar', 'Nisha Kapoor', 'Rohit Malhotra', 'Anjali Bhat', 'Vikram Rao',
    'Shreya Kulkarni', 'Nikhil Jain', 'Aarti Shetty', 'Rahul Hegde', 'Neha Kamath',
    'Christopher DSouza', 'Catherine Fernandes', 'Anthony Rodrigues', 'Monica Pereira', 'Francis Lobo',
    'Stella Dias', 'Vincent Pinto', 'Angela Sequeira', 'Lawrence Menezes', 'Rita Gomes',
    'George Varghese', 'Susan Cherian', 'Jacob Kurian', 'Leela Thomas', 'Isaac Samuel',
    'Shalom Abraham', 'Noah Paul', 'Naomi George', 'Caleb Francis', 'Abigail Peter',
    'Elijah Mathew', 'Sarah John', 'Jeremiah David', 'Rebekah Samuel', 'Isaiah Joseph',
    'Dinesh Kumar', 'Sunita Rao', 'Prakash Kumar', 'Usha Sharma', 'Mohan Kumar',
    'Radha Krishnan', 'Ganesh Sharma', 'Kamala Reddy', 'Balaji Gupta', 'Vasantha Kumar',
    'Peter DSouza', 'Maria Fernandes', 'Paul Rodrigues', 'Teresa Pereira', 'Mark Lobo',
    'Cecilia Dias', 'Luke Pinto', 'Rosemary Sequeira', 'Timothy Menezes', 'Magdalene Gomes',
    'Sunil Kumar', 'Rekha Sharma', 'Ashok Patel', 'Geeta Reddy', 'Mahesh Singh',
    'Savita Desai', 'Rajendra Kumar', 'Pushpa Sharma', 'Naresh Gupta', 'Lata Kumar',
    'Abraham Varghese', 'Mariamma Cherian', 'Koshy Kurian', 'Annamma Thomas', 'Mathai Samuel',
    'Sosamma Abraham', 'Chacko Paul', 'Aleyamma George', 'Varghese Francis', 'Thankamma Peter'
  ])[1 + floor(random() * 120)::int] as new_name
FROM registrations
WHERE name LIKE 'Member %' OR name LIKE 'Pending Member %';

-- Update the names
UPDATE registrations r
SET name = t.new_name
FROM temp_names t
WHERE r.id = t.id;

-- Drop the temp table
DROP TABLE temp_names;

-- Show summary of updated names
SELECT 
  COUNT(*) as total_updated,
  COUNT(DISTINCT name) as unique_names
FROM registrations
WHERE name NOT LIKE 'Member %' AND name NOT LIKE 'Pending Member %';

-- Show sample of new names
SELECT name, COUNT(*) as count
FROM registrations
GROUP BY name
ORDER BY count DESC
LIMIT 20;

-- Made with Bob
