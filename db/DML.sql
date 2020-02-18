-- Roles
INSERT INTO
    roles (role_id, role_name)
VALUES
    ('PADM', 'Project Admin');
INSERT INTO
    roles (role_id, role_name)
VALUES
    ('SADM', 'Super Admin');
INSERT INTO
    roles (role_id, role_name)
VALUES
    ('CCO', 'Cost Center Owner');
INSERT INTO
    roles (role_id, role_name)
VALUES
    ('USER', 'User');


INSERT INTO users
(user_id, user_name, email_address, role_id, mobile_number, full_name, user_type, active_status)
VALUES
('b4fafb0e-9b52-49a7-8ace-9203ed87eafe', 'BUEROH', 'heinz.buero@nomail.com', 'PADM', NULL, 'Heinz Buero__', 'I', 'Y'),
('01cccd45-e996-4959-8dca-5297ac2e5284', 'Q2MusteM15', 'max.mustermann@nomail.com', 'PADM', NULL, 'Max Mustermann', 'I', 'Y'),
('501dce88-4515-4dd3-93d4-8661724abda2', 'HEINOD', 'detlef.heino@partners.nomail.com', 'PADM', NULL, 'Detlef Heino', 'I', 'Y'),
('d0e6427c-4473-461e-b2ff-19edbfe7e7d9', 'Q2LaborA1', 'anton.labor@partners.nomail.com', 'PADM', NULL, 'Anton Labor', 'I', 'Y'),
('416dedea-27eb-48c0-a9d1-66600b69123c', 'HUEBENB', 'berta.huebenbecker@nomail.com', 'PADM', NULL, 'Berta Huebenbecker__', 'I', 'Y');


INSERT INTO users
(user_id, user_name, email_address, role_id, mobile_number, full_name, user_type, active_status)
VALUES
('8b93e81a-3999-4ea2-a689-37f148c97a7f', 'KumarA53', 'abhishek.kumar@partners.basf.com', 'PADM', NULL, 'Abhishek Kumar', 'I', 'Y'),
('a2cf57bb-ddc5-4c40-83f8-ad5e53c80677', 'KolkarVi', 'vikas.kolkar@partners.basf.com', 'PADM', NULL, 'Vikas Kolkar', 'I', 'Y'),
('d857cf41-342e-49db-a29a-acee1e7ef02f', 'KumarK5', 'kiran.kumar@basf.com', 'PADM', NULL, 'Kiran Kumar', 'I', 'Y'),
('e2b10278-055c-4c37-9163-cab9069b5b1a', 'KleemaE', 'eric.kleemann@basf.com', 'PADM', NULL, 'Eric Kleemann', 'I', 'Y'),
('5cf1f6c2-19b9-41ca-86ee-ee1cdac6c8a0', 'ArchanS', 'archana.sawant@partners.basf.com', 'PADM', NULL, 'Archana Sawant', 'I', 'Y'),
('7d2720fb-157f-4b0d-9675-c47ee2d0982b', 'FreitaGe', 'gerdi.freitag@basf.com', 'PADM', NULL, 'Gerdi Freitag', 'I', 'Y');


INSERT INTO autobots_admin.jira_project_type (jira_project_type_id, jira_project_type_name) VALUES
('BUSI', 'business'),
('SOFT', 'software');


INSERT INTO autobots_admin.jira_project_template (jira_project_template_key, jira_project_template_name, jira_project_type_id) 
VALUES
('com.atlassian.jira-core-project-templates:jira-core-process-management', 'Process Management', 'BUSI'),
('com.atlassian.jira-core-project-templates:jira-core-project-management', 'Project Management', 'BUSI'),
('com.atlassian.jira-core-project-templates:jira-core-task-management', 'Task Management', 'BUSI'),
('com.pyxis.greenhopper.jira:basic-software-development-template', 'Basic software development', 'SOFT'),
('com.pyxis.greenhopper.jira:gh-kanban-template', 'Kanban software development', 'SOFT'),
('com.pyxis.greenhopper.jira:gh-scrum-template', 'Scrum software development', 'SOFT');
