DO $$
DECLARE
    t_name text;
    c integer;
BEGIN
    FOR t_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('SELECT count(*) FROM public.%I', t_name) INTO c;
        IF c = 0 THEN
            RAISE NOTICE 'Empty table: %', t_name;
        END IF;
    END LOOP;
END;
$$;
