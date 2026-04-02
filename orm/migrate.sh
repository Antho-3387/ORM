#!/bin/bash
export DATABASE_URL='postgresql://postgres:G9%23fL7mZ2!qXeP8@db.ahlkrhnrkzxoxnrmnwjw.supabase.co:5432/postgres'
npx prisma migrate deploy
npx prisma generate
