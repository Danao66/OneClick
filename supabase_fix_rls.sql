-- ═══════════════════════════════════════════
-- FIX: Corriger la récursion infinie dans les RLS policies
-- ═══════════════════════════════════════════

-- Supprimer les anciennes policies problématiques
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin reads all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access clients" ON public.clients;
DROP POLICY IF EXISTS "Client reads own data" ON public.clients;
DROP POLICY IF EXISTS "Admin full access biens" ON public.biens;
DROP POLICY IF EXISTS "Client reads assigned biens" ON public.biens;
DROP POLICY IF EXISTS "Admin full access agences" ON public.agences;
DROP POLICY IF EXISTS "Admin full access journal" ON public.journal_nego;
DROP POLICY IF EXISTS "Client reads own journal" ON public.journal_nego;
DROP POLICY IF EXISTS "Admin reads admin notifications" ON public.notifications;
DROP POLICY IF EXISTS "Client reads own notifications" ON public.notifications;

-- ═══════════════════════════════════════════
-- PROFILES: utiliser auth.uid() directement, pas de sous-requête récursive
-- ═══════════════════════════════════════════

-- Chaque utilisateur peut lire SON profil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Chaque utilisateur peut mettre à jour SON profil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════════
-- Fonction helper pour vérifier le rôle admin SANS récursion
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════════
-- CLIENTS
-- ═══════════════════════════════════════════
CREATE POLICY "clients_admin_all" ON public.clients
  FOR ALL USING (public.is_admin());

CREATE POLICY "clients_own_select" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- BIENS
-- ═══════════════════════════════════════════
CREATE POLICY "biens_admin_all" ON public.biens
  FOR ALL USING (public.is_admin());

CREATE POLICY "biens_client_select" ON public.biens
  FOR SELECT USING (
    client_attribue IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════
-- AGENCES
-- ═══════════════════════════════════════════
CREATE POLICY "agences_admin_all" ON public.agences
  FOR ALL USING (public.is_admin());

-- ═══════════════════════════════════════════
-- JOURNAL NEGO
-- ═══════════════════════════════════════════
CREATE POLICY "journal_admin_all" ON public.journal_nego
  FOR ALL USING (public.is_admin());

CREATE POLICY "journal_client_select" ON public.journal_nego
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════
CREATE POLICY "notif_admin_all" ON public.notifications
  FOR ALL USING (public.is_admin());

CREATE POLICY "notif_client_select" ON public.notifications
  FOR SELECT USING (
    target = 'client' AND client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════
-- Insérer le profil admin s'il n'existe pas
-- ═══════════════════════════════════════════
INSERT INTO public.profiles (id, role, email, prenom, nom)
SELECT id, 'admin', email, 'Ludo', 'Admin'
FROM auth.users
WHERE email = 'ludovic.freelance@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
