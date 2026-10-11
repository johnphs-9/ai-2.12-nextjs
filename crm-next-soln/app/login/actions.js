'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const VALID_EMAIL = 'daniel@simplesystems.io';
const VALID_PASSWORD = 'password123';
const FAKE_TOKEN = 'not-a-real-jwt'; // stand-in for a JWT retrieved from an auth server

export async function login(previousState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
    return { error: 'Incorrect email or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('access_token', FAKE_TOKEN, {
    httpOnly: true,
    path: '/',
  });

  redirect('/crm');
}