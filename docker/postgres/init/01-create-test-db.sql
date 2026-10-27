SELECT format('CREATE DATABASE golf_test OWNER %I', current_user)
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'golf_test'
) \gexec
