-- CreateTable
CREATE TABLE "Diorama" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "compositeVvUrl" TEXT,
    "renderMode" TEXT NOT NULL DEFAULT 'layered',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diorama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DioramaObject" (
    "id" TEXT NOT NULL,
    "dioramaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT,
    "depthLayer" INTEGER NOT NULL DEFAULT 1,
    "position" JSONB NOT NULL,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "rotation" JSONB,
    "vvUrl" TEXT NOT NULL,
    "glbUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DioramaObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Diorama_createdAt_idx" ON "Diorama"("createdAt");

-- CreateIndex
CREATE INDEX "DioramaObject_dioramaId_idx" ON "DioramaObject"("dioramaId");

-- CreateIndex
CREATE INDEX "DioramaObject_depthLayer_idx" ON "DioramaObject"("depthLayer");

-- AddForeignKey
ALTER TABLE "DioramaObject" ADD CONSTRAINT "DioramaObject_dioramaId_fkey" FOREIGN KEY ("dioramaId") REFERENCES "Diorama"("id") ON DELETE CASCADE ON UPDATE CASCADE;
