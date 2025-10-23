set -e

echo "Creando bases de datos..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE auth;
    CREATE DATABASE posts;
    CREATE DATABASE notifications;
EOSQL

echo "Bases de datos creadas correctamente"