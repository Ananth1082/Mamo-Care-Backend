import { db } from "../db";
import { InvalidUserIDError } from "../Errors/user.error";

export async function CheckRole(userID: string) : Promise<string> {
  const user_role = await db.user.findUnique({
    select: {
      role: true,
    },
    where: {
      id: userID,
    },
  });
  if (!user_role) {
    throw InvalidUserIDError
  }
  return user_role.role;
}
