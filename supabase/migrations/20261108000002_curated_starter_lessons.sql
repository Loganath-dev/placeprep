-- A deliberately small, reviewed seed: one lesson per learning area, each using
-- a teaching format suited to its subject. This is not bulk-generated content.

insert into public.subjects (learning_area_id, slug, title, summary, sort_order, is_published)
select area.id, seed.slug, seed.title, seed.summary, 1, true
from public.learning_areas as area
join (values
  ('aptitude', 'quantitative-aptitude', 'Quantitative Aptitude', 'Build numerical confidence through clear models and worked calculations.'),
  ('cs-core', 'dbms', 'Database Management Systems', 'Understand how relational databases identify and connect records.'),
  ('programming', 'python', 'Python', 'Learn Python by tracing small, readable examples.'),
  ('dsa', 'algorithm-analysis', 'Algorithm Analysis', 'Reason about how work grows as input size increases.')
) as seed(area_slug, slug, title, summary) on seed.area_slug = area.slug
on conflict (learning_area_id, slug) do update set
  title = excluded.title, summary = excluded.summary, is_published = excluded.is_published;

insert into public.units (learning_area_id, subject_id, slug, title, summary, sort_order, is_published)
select area.id, subject.id, seed.unit_slug, seed.unit_title, seed.summary, 1, true
from public.learning_areas as area
join public.subjects as subject on subject.learning_area_id = area.id
join (values
  ('aptitude', 'quantitative-aptitude', 'percentage-foundations', 'Percentage foundations', 'Model a percentage as a fraction out of one hundred.'),
  ('cs-core', 'dbms', 'relational-model', 'The relational model', 'Learn how keys identify rows and connect related tables.'),
  ('programming', 'python', 'first-expressions', 'Expressions and variables', 'Read Python expressions and trace values without an execution service.'),
  ('dsa', 'algorithm-analysis', 'growth-of-work', 'The growth of work', 'Count operations as input grows, then describe the growth rate.')
) as seed(area_slug, subject_slug, unit_slug, unit_title, summary)
  on seed.area_slug = area.slug and seed.subject_slug = subject.slug
on conflict (subject_id, slug) do update set
  title = excluded.title, summary = excluded.summary, is_published = excluded.is_published;

insert into public.topics (learning_area_id, unit_id, slug, title, summary, sort_order, is_published)
select area.id, unit.id, seed.topic_slug, seed.topic_title, seed.summary, 1, true
from public.learning_areas as area
join public.subjects as subject on subject.learning_area_id = area.id
join public.units as unit on unit.subject_id = subject.id
join (values
  ('aptitude', 'quantitative-aptitude', 'percentage-foundations', 'percent-of-a-quantity', 'Find a percent of a quantity', 'Convert a percent into a fraction before calculating.'),
  ('cs-core', 'dbms', 'relational-model', 'primary-and-foreign-keys', 'Primary and foreign keys', 'Use keys to identify rows and maintain valid relationships.'),
  ('programming', 'python', 'first-expressions', 'trace-python-expressions', 'Trace Python expressions', 'Follow operator behavior and variable reassignment line by line.'),
  ('dsa', 'algorithm-analysis', 'growth-of-work', 'linear-search', 'Analyze linear search', 'Count comparisons for different positions of the target.')
) as seed(area_slug, subject_slug, unit_slug, topic_slug, topic_title, summary)
  on seed.area_slug = area.slug and seed.subject_slug = subject.slug and seed.unit_slug = unit.slug
on conflict (unit_id, slug) do update set
  title = excluded.title, summary = excluded.summary, is_published = excluded.is_published;

insert into public.lessons (
  learning_area_id, topic_id, slug, title, summary, lesson_format, difficulty,
  estimated_minutes, learning_objectives, content, version, publication_status, published_at
)
select area.id, topic.id, seed.slug, seed.title, seed.summary, seed.format, 'beginner',
  seed.minutes, seed.objectives, seed.content::jsonb, 1, 'published', now()
from public.learning_areas as area
join public.subjects as subject on subject.learning_area_id = area.id
join public.units as unit on unit.subject_id = subject.id
join public.topics as topic on topic.unit_id = unit.id
join (values
  (
    'aptitude', 'quantitative-aptitude', 'percentage-foundations', 'percent-of-a-quantity',
    'Finding a percent of a quantity',
    'A reliable way to calculate percentages is to translate “percent” into “per hundred,” then keep the base quantity visible.',
    'worked_calculation', 10,
    array['Convert a percentage to a fraction or decimal.', 'Calculate a percentage of a quantity.', 'Distinguish the original quantity from the percentage amount.']::text[],
    $percent${
      "intro":"Percentages compare a part with a whole on a scale of 100. The phrase ‘p percent of N’ means (p / 100) × N. The quantity after ‘of’ is the base; identifying it first prevents many placement-test mistakes.",
      "sections":[
        {"heading":"Build the model","paragraphs":["Percent means ‘per hundred’: 18% = 18/100 = 0.18.","To find 18% of 250, multiply the base 250 by 0.18. You can also find 10% and 8% separately when mental arithmetic is easier."]},
        {"heading":"Keep the base visible","paragraphs":["A percent change is measured against the starting value. After a 15% increase, the new value is 115% of the original.","If a final value is known after an increase, divide by 1.15 to recover the original. Subtracting 15% of the final value uses the wrong base."]}
      ],
      "worked_example":{"prompt":"A college has 250 students in a placement workshop. 18% attend a resume session. How many students attend?","steps":["Identify the base: 250 students.","Convert 18% to 18/100 = 0.18.","Calculate 0.18 × 250 = 45."],"answer":"45 students attend.","check":"10% of 250 is 25 and 8% is 20, so 18% is 25 + 20 = 45."},
      "key_takeaways":["p% of N = (p/100) × N.","The word ‘of’ identifies the base quantity.","For a percentage increase, the final amount is measured against the original base."],
      "references":[{"title":"Comparing Quantities (NCERT Exemplar, Class VII)","publisher":"National Council of Educational Research and Training","url":"https://www.ncert.nic.in/pdf/publication/exemplarproblem/classVII/Mathematics/gemp107.pdf"}]
    }$percent$
  ),
  (
    'cs-core', 'dbms', 'relational-model', 'primary-and-foreign-keys',
    'Primary keys and foreign keys',
    'Relational databases use keys to identify rows and to ensure that references point to real records.',
    'schema_explainer', 12,
    array['Explain the role of a primary key.', 'Explain how a foreign key preserves referential integrity.', 'Read a simple one-to-many relationship.']::text[],
    $dbms${
      "intro":"A relational database stores related facts in tables. A key gives each row a dependable identity or connects it to a row in another table.",
      "sections":[
        {"heading":"Primary key","paragraphs":["A primary key is a column, or group of columns, that uniquely identifies each row. Its values must be unique and non-null.","Choose an identity that remains stable. A product code is often safer than a product name, because names can change or collide."]},
        {"heading":"Foreign key","paragraphs":["A foreign key requires a value in one table to match a key in the referenced table. This prevents an order from referring to a product that does not exist.","A foreign key can be nullable unless the schema also says NOT NULL. The foreign-key rule itself is about matching referenced rows."]}
      ],
      "schema":{"tables":[
        {"name":"products","columns":[{"name":"product_id","type":"integer","key":"primary"},{"name":"name","type":"text","key":""}]},
        {"name":"orders","columns":[{"name":"order_id","type":"integer","key":"primary"},{"name":"product_id","type":"integer","key":"foreign → products.product_id"},{"name":"quantity","type":"integer","key":""}]}
      ],"relationship":"One product can appear in many orders. Each non-null orders.product_id must match a products.product_id."},
      "code":"CREATE TABLE products (\n  product_id integer PRIMARY KEY,\n  name text NOT NULL\n);\n\nCREATE TABLE orders (\n  order_id integer PRIMARY KEY,\n  product_id integer REFERENCES products(product_id),\n  quantity integer NOT NULL\n);",
      "key_takeaways":["A primary key identifies a row and cannot be null or duplicated.","A foreign key enforces a valid reference to another table.","A foreign key does not automatically mean the referencing column is non-null."],
      "references":[{"title":"PostgreSQL Documentation: Constraints","publisher":"PostgreSQL Global Development Group","url":"https://www.postgresql.org/docs/current/ddl-constraints.html"}]
    }$dbms$
  ),
  (
    'programming', 'python', 'first-expressions', 'trace-python-expressions',
    'Trace expressions and variables in Python',
    'Read a short Python program by evaluating each expression and updating the name-to-value mapping.',
    'code_walkthrough', 12,
    array['Trace arithmetic expressions using precedence.', 'Explain the result of reassignment.', 'Recognize the difference between / and //.']::text[],
    $python${
      "intro":"A variable name refers to a value. To predict a program’s output, evaluate one line at a time and update the value associated with each name.",
      "sections":[
        {"heading":"Evaluate before assigning","paragraphs":["Python evaluates the expression on the right of =, then binds the resulting value to the name on the left.","Multiplication and division take precedence over addition and subtraction. Parentheses make the intended grouping explicit."]},
        {"heading":"Division choices","paragraphs":["In Python, / performs true division and returns a floating-point result, even when the quotient is a whole number.","The // operator performs floor division: it rounds the quotient down toward negative infinity. For positive operands it often looks like truncation, but the distinction matters for negative values."]}
      ],
      "code":"price = 80\ndiscount = 15\nreduction = price * discount / 100\nfinal_price = price - reduction\nprint(reduction, final_price)",
      "line_notes":[
        {"line":1,"note":"Bind price to the integer 80."},
        {"line":2,"note":"Bind discount to 15. The variable stores the number; the percent interpretation comes from the calculation."},
        {"line":3,"note":"Multiplication and division proceed left to right: 80 × 15 / 100 gives 12.0."},
        {"line":4,"note":"Subtract the reduction from the original price: 80 − 12.0 gives 68.0."},
        {"line":5,"note":"The output is 12.0 68.0. This walkthrough predicts output; it does not execute code in StudyBench."}
      ],
      "key_takeaways":["Assignment evaluates the right side before binding the left-side name.","Use parentheses when they make grouping easier to inspect.","Python’s / returns a float; // uses floor division."],
      "references":[{"title":"An Informal Introduction to Python","publisher":"Python Software Foundation","url":"https://docs.python.org/3/tutorial/introduction.html"}]
    }$python$
  ),
  (
    'dsa', 'algorithm-analysis', 'growth-of-work', 'linear-search',
    'Count the work in linear search',
    'Analyze a simple search by counting comparisons, then describe how that count changes with input size.',
    'problem_solving', 12,
    array['Define input size for a search.', 'Count comparisons in best and worst cases.', 'Describe linear search with an asymptotic upper bound.']::text[],
    $dsa${
      "intro":"Time complexity describes how an algorithm’s work grows with input size. Start by choosing a basic operation to count—in this example, comparing one array value with the target.",
      "sections":[
        {"heading":"State the input size","paragraphs":["Let n be the number of elements in the array. A linear search checks elements from left to right and stops when it finds the target or reaches the end.","Counting comparisons is a useful model. It does not claim that every comparison takes the same real-world time on every machine."]},
        {"heading":"Describe the growth","paragraphs":["If the first element matches, there is 1 comparison. If the last element matches—or the target is absent—there can be n comparisons.","The worst-case count grows linearly with n, so the worst-case running time is O(n). Big O is an upper-bound notation; when discussing a specific algorithm, name the case being analyzed."]}
      ],
      "challenge":"For an array of 8 values, how many comparisons can linear search make when the target is absent?",
      "reasoning_steps":["The target is absent, so the algorithm cannot stop on a match.","It checks each of the 8 values once.","That is 8 comparisons. For n values, the same case requires n comparisons."],
      "answer":"8 comparisons for this input; n comparisons in the absent-target worst case.",
      "complexity":{"time":"O(n) worst case","space":"O(1) auxiliary space","assumption":"The search stores only a fixed number of extra values and scans the array in place."},
      "key_takeaways":["Define n before counting work.","Linear search uses at most n comparisons and may stop sooner.","O(n) describes an asymptotic upper bound, not a stopwatch measurement."],
      "references":[{"title":"Calculating Program Running Time","publisher":"OpenDSA, Virginia Tech","url":"https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/AnalProgram.html"},{"title":"Introduction to Algorithms: Asymptotic Notation","publisher":"MIT OpenCourseWare","url":"https://live.ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/c6d8f06c6f11e3342633dec85498f551_MIT6_006S20_r01.pdf"}]
    }$dsa$
  )
) as seed(area_slug, subject_slug, unit_slug, topic_slug, slug, title, summary, format, minutes, objectives, content)
  on seed.area_slug = area.slug and seed.subject_slug = subject.slug
  and seed.unit_slug = unit.slug and seed.topic_slug = topic.slug
on conflict (learning_area_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  lesson_format = excluded.lesson_format,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  learning_objectives = excluded.learning_objectives,
  content = excluded.content,
  version = excluded.version,
  publication_status = excluded.publication_status,
  published_at = excluded.published_at;

insert into public.roadmap_nodes (
  learning_area_id, unit_id, topic_id, lesson_id, node_type, title, summary,
  sequence_order, estimated_minutes, access_tier, publication_status
)
select lesson.learning_area_id, topic.unit_id, lesson.topic_id, lesson.id,
  'lesson', lesson.title, lesson.summary, 1, lesson.estimated_minutes,
  lesson.access_tier, 'published'
from public.lessons as lesson
join public.topics as topic on topic.id = lesson.topic_id
where lesson.slug in ('percent-of-a-quantity', 'primary-and-foreign-keys', 'trace-python-expressions', 'linear-search')
on conflict (learning_area_id, sequence_order) do update set
  unit_id = excluded.unit_id,
  topic_id = excluded.topic_id,
  lesson_id = excluded.lesson_id,
  title = excluded.title,
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  access_tier = excluded.access_tier,
  publication_status = excluded.publication_status;
