#!/usr/bin/env python3
"""
Script de migration et création admin pour Servicall v2 Production
"""
import os
import sys
import glob
import re
import subprocess

DB_URL = "postgresql://servicall:Servicall2026x@localhost:5432/servicall_db"
MIGRATIONS_DIR = "/home/ubuntu/servicall/verify/drizzle/migrations"

def run_sql_file(filepath):
    """Exécute un fichier SQL en gérant les statement-breakpoint"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remplacer les --> statement-breakpoint par des séparateurs
    statements = re.split(r'--> statement-breakpoint', content)
    
    errors = []
    for stmt in statements:
        stmt = stmt.strip()
        if not stmt:
            continue
        result = subprocess.run(
            ['psql', DB_URL, '-c', stmt],
            capture_output=True, text=True
        )
        if result.returncode != 0 and 'already exists' not in result.stderr and 'duplicate' not in result.stderr.lower():
            errors.append(f"  WARN: {result.stderr.strip()[:100]}")
    
    return errors

def main():
    print("=" * 60)
    print("  SERVICALL v2 - Migrations PostgreSQL")
    print("=" * 60)
    
    # Récupérer les fichiers de migration dans l'ordre
    migration_files = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, "*.sql")))
    
    print(f"\n[1/3] Application de {len(migration_files)} fichiers de migration...")
    
    for mf in migration_files:
        fname = os.path.basename(mf)
        print(f"  → {fname}", end=" ", flush=True)
        errors = run_sql_file(mf)
        if errors:
            print(f"⚠️  ({len(errors)} warnings)")
            for e in errors[:3]:
                print(f"     {e}")
        else:
            print("✅")
    
    print("\n[2/3] Vérification des tables créées...")
    result = subprocess.run(
        ['psql', DB_URL, '-c', 
         "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"],
        capture_output=True, text=True
    )
    tables = [line.strip() for line in result.stdout.split('\n') if line.strip() and '|' not in line and 'tablename' not in line and '---' not in line and 'row' not in line]
    print(f"  Tables créées: {len(tables)}")
    for t in tables[:10]:
        print(f"    - {t}")
    if len(tables) > 10:
        print(f"    ... et {len(tables)-10} autres")
    
    print("\n[3/3] Création du compte admin...")
    admin_sql = """
    -- Créer le tenant par défaut
    INSERT INTO tenants (slug, name, is_active, settings)
    VALUES ('default', 'Servicall Production', true, '{}')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
    """
    
    result = subprocess.run(
        ['psql', DB_URL, '-c', admin_sql],
        capture_output=True, text=True
    )
    print(f"  Tenant: {result.stdout.strip()[:80] if result.returncode == 0 else result.stderr.strip()[:80]}")
    
    # Récupérer l'ID du tenant
    result = subprocess.run(
        ['psql', DB_URL, '-t', '-c', "SELECT id FROM tenants WHERE slug='default' LIMIT 1;"],
        capture_output=True, text=True
    )
    tenant_id = result.stdout.strip()
    print(f"  Tenant ID: {tenant_id}")
    
    # Vérifier si admin existe
    result = subprocess.run(
        ['psql', DB_URL, '-t', '-c', "SELECT id, email FROM users WHERE role='admin' LIMIT 1;"],
        capture_output=True, text=True
    )
    
    if result.stdout.strip():
        print(f"  ✅ Admin existe déjà: {result.stdout.strip()}")
    else:
        print("  Création du compte admin...")
        # Hash bcrypt du mot de passe Admin2026Prod
        import hashlib, hmac, base64
        # Utiliser node pour générer le hash bcrypt
        hash_result = subprocess.run(
            ['node', '-e', '''
const bcrypt = require('bcryptjs');
bcrypt.hash('Admin2026Prod', 12).then(h => console.log(h));
'''],
            capture_output=True, text=True,
            cwd='/home/ubuntu/servicall/verify'
        )
        password_hash = hash_result.stdout.strip()
        print(f"  Hash généré: {password_hash[:30]}...")
        
        import uuid
        open_id = str(uuid.uuid4()).replace('-', '')[:21]
        
        insert_sql = f"""
        INSERT INTO users (open_id, email, name, password_hash, login_method, role, last_signed_in)
        VALUES ('{open_id}', 'admin@servicall.com', 'Admin Servicall', '{password_hash}', 'password', 'admin', NOW())
        ON CONFLICT (email) DO UPDATE SET role='admin', password_hash=EXCLUDED.password_hash
        RETURNING id, email;
        """
        
        result = subprocess.run(
            ['psql', DB_URL, '-c', insert_sql],
            capture_output=True, text=True
        )
        
        if result.returncode == 0:
            print(f"  ✅ Admin créé: {result.stdout.strip()[:80]}")
            
            # Récupérer l'ID admin
            result2 = subprocess.run(
                ['psql', DB_URL, '-t', '-c', "SELECT id FROM users WHERE email='admin@servicall.com' LIMIT 1;"],
                capture_output=True, text=True
            )
            admin_id = result2.stdout.strip()
            
            if admin_id and tenant_id:
                # Lier admin au tenant
                link_sql = f"""
                INSERT INTO tenant_users (user_id, tenant_id, role, is_active)
                VALUES ({admin_id}, {tenant_id}, 'owner', true)
                ON CONFLICT DO NOTHING;
                """
                subprocess.run(['psql', DB_URL, '-c', link_sql], capture_output=True)
                print(f"  ✅ Admin lié au tenant (user_id={admin_id}, tenant_id={tenant_id})")
        else:
            print(f"  ❌ Erreur: {result.stderr.strip()[:200]}")
    
    print("\n" + "=" * 60)
    print("  Migration terminée !")
    print("  Admin: admin@servicall.com / Admin2026Prod")
    print("=" * 60)

if __name__ == '__main__':
    main()
