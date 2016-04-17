drop table if exists session, fm_registration;

CREATE TABLE session (id MEDIUMINT NOT NULL AUTO_INCREMENT, user_id VARCHAR(30) NOT NULL, device_id VARCHAR(30) NOT NULL, ip VARCHAR(30) NOT NULL, status VARCHAR(10) NOT NULL, fm_id VARCHAR(10), socket_id VARCHAR(50), PRIMARY KEY (id));

CREATE TABLE fm_registration (fm_id VARCHAR(10) NOT NULL, fm_ip VARCHAR(30) NOT NULL, fm_port VARCHAR(10) NOT NULL, PRIMARY KEY (fm_id));
