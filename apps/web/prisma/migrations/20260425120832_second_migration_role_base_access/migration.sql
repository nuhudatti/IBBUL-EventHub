-- CreateIndex
CREATE INDEX "Event_organizationId_status_startTime_idx" ON "Event"("organizationId", "status", "startTime");

-- CreateIndex
CREATE INDEX "User_organizationId_role_idx" ON "User"("organizationId", "role");
