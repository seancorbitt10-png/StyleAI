import { UnauthorizedError } from '@styleai/core';
import { bearerToken, errorResponse, json, servicesForUser, userIdFromRequest } from '@/server/compose';

export async function GET(request: Request) {
  try {
    const userId = await userIdFromRequest(request);
    const token = bearerToken(request);
    if (!token) throw new UnauthorizedError();
    const { entitlements } = servicesForUser(token);
    const plan = await entitlements.getActivePlan(userId);
    return json({
      planId: plan.id,
      displayName: plan.displayName,
      limits: plan.limits,
    });
  } catch (error) {
    const status = error instanceof UnauthorizedError ? 401 : 400;
    return errorResponse(error, status);
  }
}
