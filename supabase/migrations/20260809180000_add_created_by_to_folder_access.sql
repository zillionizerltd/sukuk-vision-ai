ALTER TABLE public.folder_access ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
