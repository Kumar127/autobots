CREATE TABLE roles(
    role_id VARCHAR(100) PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL
);

CREATE TABLE users(
    user_id VARCHAR(36) PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email_address VARCHAR(100) NOT NULL,
    role_id VARCHAR(10),
    mobile_number VARCHAR(100),
    full_name VARCHAR(100),
    user_type CHAR(1),
    active_status CHAR(1),
    CONSTRAINT fk_users_roles FOREIGN KEY(role_id) REFERENCES roles(role_id),
    CONSTRAINT chk_user_type CHECK (user_type IN ('I', 'E'))
);

CREATE TABLE jira_projects(
    jira_project_id VARCHAR(100) PRIMARY KEY,
    jira_project_name VARCHAR(100),
    jira_project_key VARCHAR(10),
    jira_project_type VARCHAR(10),
    jira_project_lead VARCHAR(100),
    jira_project_url VARCHAR(255),
    CONSTRAINT chck_project_type CHECK (jira_project_type IN ('software', 'business'))
);

CREATE TABLE projects(
    project_id VARCHAR(100) PRIMARY KEY,
    project_name VARCHAR(255),
    project_description VARCHAR(255),
    jira_project_id VARCHAR(100),
    CONSTRAINT fk_projects_jira FOREIGN KEY(jira_project_id) REFERENCES jira_projects(jira_project_id),
    CONSTRAINT project_name_unique UNIQUE (project_name)
);

CREATE TABLE project_users(
    project_users_id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(100),
    user_id VARCHAR(36),
    CONSTRAINT fk_projects_users FOREIGN KEY(project_id) REFERENCES projects(project_id),
    CONSTRAINT fk_projects_users_users FOREIGN KEY(user_id) REFERENCES users(user_name)
);

create table users_jira_role (
	users_jira_role_id VARCHAR(36) PRIMARY KEY,
	jira_project_id VARCHAR(36),
	user_id VARCHAR(36),
	project_role VARCHAR(100) NOT NULL,
    project_role_id VARCHAR(100),
    CONSTRAINT fk_jira_project_user_jira_role FOREIGN KEY(jira_project_id) REFERENCES jira_projects(jira_project_id),
    CONSTRAINT fk_user_user_jira_role FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE jira_project_type (
  jira_project_type_id varchar(10) NOT NULL,
  jira_project_type_name varchar(100) NOT NULL,
  PRIMARY KEY (jira_project_type_id)
);

CREATE TABLE jira_project_template (
  jira_project_template_key varchar(100) NOT NULL,
  jira_project_template_name varchar(100) NOT NULL,
  jira_project_type_id varchar(10) DEFAULT NULL,
  PRIMARY KEY (jira_project_template_key),
  KEY jira_project_type_id (jira_project_type_id),
  CONSTRAINT jira_project_template_jira_project_type FOREIGN KEY (jira_project_type_id) REFERENCES jira_project_type (jira_project_type_id)
);

ALTER TABLE users
ADD CONSTRAINT user_name_unique UNIQUE(user_name);

ALTER TABLE projects
ADD COLUMN created_by VARCHAR(36);

ALTER TABLE projects
ADD FOREIGN KEY fk_created_by(created_by) REFERENCES users(user_name) ;


ALTER TABLE jira_projects
ADD COLUMN jira_project_template_key VARCHAR(100);

ALTER TABLE jira_projects
ADD FOREIGN KEY fk_jira_project_template(jira_project_template_key) REFERENCES jira_project_template(jira_project_template_key)

ALTER TABLE jira_projects
DROP CONSTRAINT chck_project_type;

CREATE TABLE jenkins_projects(
    jenkins_project_id VARCHAR(36) PRIMARY KEY,
    jenkins_project_name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    pattern VARCHAR(100),
    url VARCHAR(100),
    project_role VARCHAR(100)
);

CREATE TABLE jenkins_users(
jenkins_users_id VARCHAR(36) PRIMARY KEY,
jenkins_project_id VARCHAR(36),
user_id VARCHAR(36),
CONSTRAINT fk_projects_jenkins FOREIGN KEY(jenkins_project_id) REFERENCES jenkins_projects(jenkins_project_id),
CONSTRAINT fk_user_jenkins FOREIGN KEY(user_id) REFERENCES users(user_name)
);

ALTER TABLE projects
ADD COLUMN jenkins_project_type VARCHAR(50)

ALTER TABLE projects
ADD COLUMN jenkins_project_id VARCHAR(36)

ALTER TABLE projects
ADD FOREIGN KEY fk_group_jenkins_project(jenkins_project_id) REFERENCES jenkins_projects(jenkins_project_id) ;
          
CREATE TABLE sonarqube_projects(
    sonarqube_project_id VARCHAR(36) PRIMARY KEY,
    sonarqube_project_name VARCHAR(100) NOT NULL,
    sonarqube_project_key VARCHAR(100) UNIQUE,
    sonarqube_project_visibility VARCHAR(10),
    sonarqube_project_organization VARCHAR(100),
    sonarqube_project_group_name VARCHAR(255) ,
    CONSTRAINT chck_project_visibility CHECK (sonarqube_project_visibility IN ('public', 'private'))
);

CREATE TABLE sonarqube_users(
	sonarqube_users_id VARCHAR(36) PRIMARY KEY,
	sonarqube_project_id VARCHAR(36),
	sonarqube_user_login_id VARCHAR(40) NOT NULL , -- Can be email for external users
	sonarqube_user_password VARCHAR(36) NOT NULL ,
	sonarqube_user_name VARCHAR(40), 
	sonarqube_user_email VARCHAR(40),
	CONSTRAINT fk_projects_sonarqube FOREIGN KEY(sonarqube_project_id) REFERENCES sonarqube_projects(sonarqube_project_id),
	CONSTRAINT fk_user_sonarqube FOREIGN KEY(sonarqube_user_login_id) REFERENCES users(user_name)
	);
ALTER TABLE projects
	ADD COLUMN sonarqube_project_id VARCHAR(36)

ALTER TABLE projects
	ADD FOREIGN KEY fk_group_sonarqube_project(sonarqube_project_id) REFERENCES sonarqube_projects(sonarqube_project_id);