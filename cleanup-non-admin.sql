


SET FOREIGN_KEY_CHECKS = 0;


DELETE FROM alerts WHERE patient_id NOT IN (SELECT user_id FROM users WHERE role = 'ADMIN');
DELETE FROM health_readings WHERE patient_id NOT IN (SELECT user_id FROM users WHERE role = 'ADMIN');
DELETE FROM appointments WHERE patient_id NOT IN (SELECT user_id FROM users WHERE role = 'ADMIN');

DELETE a FROM appointments a
  LEFT JOIN users u ON u.user_id = a.doctor_id
  WHERE u.role IS NULL OR u.role != 'ADMIN';
DELETE FROM medical_records WHERE patient_id NOT IN (SELECT user_id FROM users WHERE role = 'ADMIN');
DELETE FROM prescriptions WHERE patient_id NOT IN (SELECT user_id FROM users WHERE role = 'ADMIN');
DELETE FROM lab_reports WHERE patient_id NOT IN (SELECT user_id FROM users WHERE role = 'ADMIN')
  OR created_by NOT IN (SELECT user_id FROM users WHERE role = 'ADMIN');


DELETE FROM doctors WHERE doctor_id NOT IN (SELECT user_id FROM users WHERE role = 'ADMIN');


DELETE FROM users WHERE role != 'ADMIN';

SET FOREIGN_KEY_CHECKS = 1;


SELECT user_id, name, email, role FROM users;
SELECT COUNT(*) AS remaining_users FROM users;
SELECT COUNT(*) AS remaining_doctors FROM doctors;
