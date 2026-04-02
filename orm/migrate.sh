#!/bin/bash
export DATABASE_URL='postgresql://postgres:G9%23fL7mZ2%21qXeP8@db.ahlkrhnrkzxoxnrmnwjw.supabase.co:5432/postgres'
npx prisma migrate deploy
npx prisma db push
npx prisma generate
