-- Generic audit trigger
CREATE OR REPLACE FUNCTION private.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_name text;
  v_action text;
  v_target text;
  v_details jsonb;
  v_label_col text := TG_ARGV[0];
  v_rec jsonb;
  v_old jsonb;
  v_changed jsonb := '{}'::jsonb;
  k text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_rec := to_jsonb(OLD);
    v_action := 'Deleted';
  ELSIF TG_OP = 'UPDATE' THEN
    v_rec := to_jsonb(NEW);
    v_old := to_jsonb(OLD);
    v_action := 'Updated';
  ELSE
    v_rec := to_jsonb(NEW);
    v_action := 'Created';
  END IF;

  IF v_label_col IS NOT NULL THEN
    v_target := v_rec ->> v_label_col;
  END IF;
  IF v_target IS NULL OR v_target = '' THEN
    v_target := v_rec ->> 'id';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    FOR k IN SELECT jsonb_object_keys(v_rec) LOOP
      IF k <> 'updated_at' AND (v_rec -> k) IS DISTINCT FROM (v_old -> k) THEN
        v_changed := v_changed || jsonb_build_object(k, jsonb_build_array(v_old -> k, v_rec -> k));
      END IF;
    END LOOP;
    IF v_changed = '{}'::jsonb THEN
      RETURN COALESCE(NEW, OLD);
    END IF;
    v_details := jsonb_build_object('changes', v_changed);
  ELSE
    v_details := jsonb_build_object('row', v_rec - 'id');
  END IF;

  IF v_actor IS NOT NULL THEN
    SELECT NULLIF(TRIM(COALESCE(p.full_name, '')), '') INTO v_name
    FROM public.profiles p WHERE p.id = v_actor;
  END IF;

  INSERT INTO public.audit_log (actor_id, actor_name, action, target, target_type, details)
  VALUES (v_actor, COALESCE(v_name, 'System'), v_action, v_target, TG_TABLE_NAME, v_details);

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION private.audit_row_change() FROM PUBLIC;

-- Attach to all business tables
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('documents','name'),
      ('tasks','title'),
      ('milestones','title'),
      ('risks','title'),
      ('compliance_items','requirement'),
      ('financial_metrics','metric'),
      ('sukuk_structures','name'),
      ('reports','name'),
      ('stakeholders','org'),
      ('organisations','name'),
      ('folder_access','folder'),
      ('item_comments','item_type'),
      ('profiles','full_name'),
      ('user_roles','role')
    ) AS v(tbl, label)
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS zz_audit_%1$s ON public.%1$s', t.tbl);
    EXECUTE format(
      'CREATE TRIGGER zz_audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION private.audit_row_change(%2$L)',
      t.tbl, t.label
    );
  END LOOP;
END;
$$;
