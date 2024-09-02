# Use the official PostgreSQL image as a base
FROM postgres:14

# Copy the initialization script into the container
COPY init-db.sh /docker-entrypoint-initdb.d/

# Ensure the script has the correct permissions
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh