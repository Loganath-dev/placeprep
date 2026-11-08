-- Each question is reviewed alongside its lesson. Answer keys stay in a table
-- that is never exposed to the browser before the learner submits an answer.
insert into public.questions (
  lesson_id, question_type, prompt, code_snippet, input_config, sort_order, publication_status
)
select lesson.id, seed.question_type, seed.prompt, seed.code_snippet, seed.input_config::jsonb,
  seed.sort_order, 'published'
from public.lessons as lesson
join (values
  ('percent-of-a-quantity', 'numerical', 'What is 18% of 250?', null, '{}', 1),
  ('percent-of-a-quantity', 'single_choice', 'A value rises from 200 to 230. Which expression calculates the percentage increase using the original value as the base?', null, '{}', 2),
  ('primary-and-foreign-keys', 'single_choice', 'Which statement is required for a primary key?', null, '{}', 1),
  ('primary-and-foreign-keys', 'multiple_choice', 'Which statements about a foreign key are true? Select all that apply.', null, '{}', 2),
  ('trace-python-expressions', 'output_prediction', 'What does this Python code print?', 'count = 7\ncount = count * 2 + 1\nprint(count)', '{}', 1),
  ('trace-python-expressions', 'find_error', 'Which line produces an incorrect 15% discount amount?', 'price = 80\ndiscount = 15\nreduction = price + discount / 100\nfinal_price = price - reduction', '{}', 2),
  ('linear-search', 'single_choice', 'In the worst case, how many comparisons does linear search make on an array of n elements?', null, '{}', 1),
  ('linear-search', 'multiple_choice', 'Which statements correctly describe linear search? Select all that apply.', null, '{}', 2)
) as seed(lesson_slug, question_type, prompt, code_snippet, input_config, sort_order)
  on lesson.slug = seed.lesson_slug
on conflict (lesson_id, sort_order) do update set
  question_type = excluded.question_type,
  prompt = excluded.prompt,
  code_snippet = excluded.code_snippet,
  input_config = excluded.input_config,
  publication_status = excluded.publication_status;

insert into public.question_options (question_id, option_key, body, sort_order)
select question.id, seed.option_key, seed.body, seed.sort_order
from public.questions as question
join public.lessons as lesson on lesson.id = question.lesson_id
join (values
  ('percent-of-a-quantity', 2, 'a', '(230 - 200) / 200 × 100', 1),
  ('percent-of-a-quantity', 2, 'b', '(230 - 200) / 230 × 100', 2),
  ('percent-of-a-quantity', 2, 'c', '230 / 200 × 100', 3),
  ('percent-of-a-quantity', 2, 'd', '200 / 230 × 100', 4),
  ('primary-and-foreign-keys', 1, 'a', 'It may contain duplicate values if the table has a foreign key.', 1),
  ('primary-and-foreign-keys', 1, 'b', 'Its values must be unique and non-null.', 2),
  ('primary-and-foreign-keys', 1, 'c', 'It must always be a text column.', 3),
  ('primary-and-foreign-keys', 1, 'd', 'It must also be a foreign key.', 4),
  ('primary-and-foreign-keys', 2, 'a', 'It can require a referencing value to match a row in another table.', 1),
  ('primary-and-foreign-keys', 2, 'b', 'It automatically makes the referencing column a primary key.', 2),
  ('primary-and-foreign-keys', 2, 'c', 'It can be nullable unless another constraint prohibits nulls.', 3),
  ('primary-and-foreign-keys', 2, 'd', 'It stores a password for the related row.', 4),
  ('trace-python-expressions', 1, 'a', '7', 1),
  ('trace-python-expressions', 1, 'b', '14', 2),
  ('trace-python-expressions', 1, 'c', '15', 3),
  ('trace-python-expressions', 1, 'd', '16', 4),
  ('trace-python-expressions', 2, 'a', 'Line 1', 1),
  ('trace-python-expressions', 2, 'b', 'Line 2', 2),
  ('trace-python-expressions', 2, 'c', 'Line 3', 3),
  ('trace-python-expressions', 2, 'd', 'Line 4', 4),
  ('linear-search', 1, 'a', '1', 1),
  ('linear-search', 1, 'b', 'log n', 2),
  ('linear-search', 1, 'c', 'n', 3),
  ('linear-search', 1, 'd', 'n²', 4),
  ('linear-search', 2, 'a', 'It can stop when it finds a matching value.', 1),
  ('linear-search', 2, 'b', 'It needs an already-sorted array.', 2),
  ('linear-search', 2, 'c', 'It can make n comparisons when the target is absent.', 3),
  ('linear-search', 2, 'd', 'It always uses O(n) additional space.', 4)
) as seed(lesson_slug, question_order, option_key, body, sort_order)
  on seed.lesson_slug = lesson.slug and seed.question_order = question.sort_order
on conflict (question_id, option_key) do update set body = excluded.body, sort_order = excluded.sort_order;

insert into public.question_answer_keys (question_id, answer)
select question.id, seed.answer::jsonb
from public.questions as question
join public.lessons as lesson on lesson.id = question.lesson_id
join (values
  ('percent-of-a-quantity', 1, '{"value":"45"}'),
  ('percent-of-a-quantity', 2, '{"selected":["a"]}'),
  ('primary-and-foreign-keys', 1, '{"selected":["b"]}'),
  ('primary-and-foreign-keys', 2, '{"selected":["a","c"]}'),
  ('trace-python-expressions', 1, '{"selected":["c"]}'),
  ('trace-python-expressions', 2, '{"selected":["c"]}'),
  ('linear-search', 1, '{"selected":["c"]}'),
  ('linear-search', 2, '{"selected":["a","c"]}')
) as seed(lesson_slug, question_order, answer)
  on seed.lesson_slug = lesson.slug and seed.question_order = question.sort_order
on conflict (question_id) do update set answer = excluded.answer;

insert into public.question_explanations (question_id, explanation)
select question.id, seed.explanation
from public.questions as question
join public.lessons as lesson on lesson.id = question.lesson_id
join (values
  ('percent-of-a-quantity', 1, '18% means 18/100. Multiplying 250 by 18/100 gives 45.'),
  ('percent-of-a-quantity', 2, 'Percentage increase is change divided by the original value, then multiplied by 100: (230 − 200) / 200 × 100.'),
  ('primary-and-foreign-keys', 1, 'A primary key identifies a row. It must be unique and non-null.'),
  ('primary-and-foreign-keys', 2, 'A foreign key can enforce a valid reference, and it can be nullable unless a separate NOT NULL constraint is present.'),
  ('trace-python-expressions', 1, 'The right side is evaluated first: 7 × 2 + 1 is 15, so the program prints 15.'),
  ('trace-python-expressions', 2, 'Line 3 adds the percentage fraction to the price. A 15% discount amount is price × discount / 100, which is 12.0 here.'),
  ('linear-search', 1, 'When the target is last or absent, linear search compares against every element, so it makes n comparisons.'),
  ('linear-search', 2, 'Linear search can stop on a match and may inspect every item when the target is absent. It does not require sorted input and uses constant auxiliary space.')
) as seed(lesson_slug, question_order, explanation)
  on seed.lesson_slug = lesson.slug and seed.question_order = question.sort_order
on conflict (question_id) do update set explanation = excluded.explanation;
