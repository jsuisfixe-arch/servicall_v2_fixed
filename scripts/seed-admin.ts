import postgres from 'postgres';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

export async function seedAdmin() {
  const email = 'admin@servicall.com';
  const password = 'Admin_password123!'; // Mot de passe fort
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingAdmin.length > 0) {
      console.log('Admin account already exists. Skipping creation.');
      return; // ✅ FIX: return au lieu de process.exit(0)
    }

    // Création de l'admin
    const [user] = await sql`
      INSERT INTO users (
        open_id, 
        email, 
        password_hash, 
        role, 
        name, 
        is_active, 
        login_method,
        created_at,
        updated_at
      ) VALUES (
        ${nanoid()}, 
        ${email}, 
        ${hashedPassword}, 
        'owner', 
        'Admin Servicall', 
        true, 
        'local',
        NOW(),
        NOW()
      ) RETURNING *
    `;
    
    console.log('Admin account created successfully:', user);

    // Création d'un tenant par défaut pour cet admin
    const [tenant] = await sql`
      INSERT INTO tenants (
        slug, 
        name, 
        is_active,
        created_at,
        updated_at
      ) VALUES (
        ${`tenant-${user.id}`}, 
        ${`Espace ${user.name}`}, 
        true,
        NOW(),
        NOW()
      ) RETURNING *
    `;

    // Lier l'admin au tenant
    await sql`
      INSERT INTO tenant_users (
        user_id, 
        tenant_id, 
        role,
        created_at,
        updated_at
      ) VALUES (
        ${user.id}, 
        ${tenant.id}, 
        'owner',
        NOW(),
        NOW()
      )
    `;

    console.log('Default tenant and user-tenant link created successfully.');
    // ✅ FIX: return au lieu de process.exit(0)
  } catch (error: any) {
    console.error('Error seeding admin account and default tenant:', error);
    throw error; // ✅ FIX: throw au lieu de process.exit(1)
  }
}

// ✅ FIX: Ne pas appeler seedAdmin() automatiquement lors de l'import
// seedAdmin(); // Supprimé pour éviter process.exit lors de l'import par le serveur
