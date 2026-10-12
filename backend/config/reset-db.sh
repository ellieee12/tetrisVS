#!/bin/bash
cd "$(dirname "$0")" #run from the script's own folder
DB=tetris_game
SCHEMA=schema.sql
SEED=seed.sql
sudo -su postgres psql -c "DROP DATABASE IF EXISTS $DB WITH (FORCE);"
sudo -su postgres psql -c "CREATE DATABASE $DB;"
sudo -su postgres psql -d $DB < $SCHEMA
sudo -su postgres psql -d $DB < $SEED
