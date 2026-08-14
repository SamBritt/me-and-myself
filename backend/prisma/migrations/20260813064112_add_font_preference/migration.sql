-- CreateEnum
CREATE TYPE "FontFamily" AS ENUM ('SYSTEM', 'MONTSERRAT', 'LORA', 'JETBRAINS_MONO', 'NUNITO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fontPreference" "FontFamily" NOT NULL DEFAULT 'SYSTEM';
