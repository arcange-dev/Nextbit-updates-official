-- Optional starter source registry. The backend seeds content from server/data.mjs.
insert into public.sources(name,url,reliability,verification_notes) values
('Google News','https://news.google.com/','review','Discovery RSS layer; keep original publisher attribution and link.'),
('TechCrunch','https://techcrunch.com/','trusted','Publisher RSS; keep attribution and original link.'),
('The Verge','https://www.theverge.com/','review','Publisher RSS; keep attribution and original link.'),
('Ars Technica','https://arstechnica.com/','review','Publisher RSS; keep attribution and original link.'),
('WIRED','https://www.wired.com/','review','Publisher RSS; keep attribution and original link.'),
('NVIDIA','https://www.nvidia.com/','trusted','Official company feed.')
on conflict(url) do nothing;
