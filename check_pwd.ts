import bcrypt from 'bcryptjs';

const hash = '$2b$12$EgyVSk0QZCBKJFlpU9psVe15bBK2PCEo4mcaNexOWR90MbmJdm.vC';
const passwords = ['Admin@Servicall2024!', 'admin123', 'Admin@2026!', 'servicall', 'Servicall2024'];

for (const pwd of passwords) {
  const result = await bcrypt.compare(pwd, hash);
  console.log(`${pwd}: ${result}`);
}
