#!/bin/bash
set -e

KEYFILE=/data/replica.key

# Si no existe la clave de autenticación interna entre réplicas, generarla
if [ ! -f "$KEYFILE" ]; then
  openssl rand -base64 756 > "$KEYFILE"
fi

# Asignar permisos estrictos requeridos por MongoDB (0400 / solo lectura para el usuario mongodb)
chmod 400 "$KEYFILE"
chown mongodb:mongodb "$KEYFILE"

# Iniciar un proceso en segundo plano para inicializar rs0 una vez que mongod esté listo
(
  AUTH_ARGS=""
  if [ -n "$MONGO_INITDB_ROOT_USERNAME" ] && [ -n "$MONGO_INITDB_ROOT_PASSWORD" ]; then
    AUTH_ARGS="-u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin"
  fi

  echo "Esperando que MongoDB responda para verificar/iniciar el ReplicaSet rs0..."
  until mongosh $AUTH_ARGS --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1 || mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    sleep 2
  done

  echo "Inicializando o verificando ReplicaSet rs0..."
  mongosh $AUTH_ARGS --quiet --eval "
    try {
      const status = rs.status();
      if (status.ok === 1) {
        console.log('ReplicaSet rs0 ya esta activo');
      }
    } catch (e) {
      console.log('Inicializando ReplicaSet rs0...');
      rs.initiate({
        _id: 'rs0',
        members: [{ _id: 0, host: 'store-db:27017' }]
      });
    }
  " || mongosh --quiet --eval "
    try {
      const status = rs.status();
      if (status.ok === 1) {
        console.log('ReplicaSet rs0 ya esta activo');
      }
    } catch (e) {
      console.log('Inicializando ReplicaSet rs0...');
      rs.initiate({
        _id: 'rs0',
        members: [{ _id: 0, host: 'store-db:27017' }]
      });
    }
  " || true
) &

# Ejecutar el punto de entrada oficial de la imagen de Mongo con los parámetros de replica set y keyFile
exec docker-entrypoint.sh mongod --replSet rs0 --keyFile "$KEYFILE" --bind_ip_all
