-- Run this in pgAdmin Query Tool on rarp_apartment database
-- OR in psql after connecting

GRANT ALL ON SCHEMA public TO apartment_user;
GRANT ALL PRIVILEGES ON DATABASE rarp_apartment TO apartment_user;
ALTER DATABASE rarp_apartment OWNER TO apartment_user;
