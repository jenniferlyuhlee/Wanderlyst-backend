\echo 'Delete and recreate wanderlyst db?'
\prompt 'Return for yes or control-C to cancel >' foo

\connect wanderlyst_test
DROP DATABASE wanderlyst;
CREATE DATABASE wanderlyst;
\connect wanderlyst

\i wanderlyst-schema.sql

\echo 'Delete and recreate wanderlyst_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE wanderlyst_test;
CREATE DATABASE wanderlyst_test;
\connect wanderlyst_test

\i wanderlyst-schema.sql
