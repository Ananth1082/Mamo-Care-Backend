import { db } from "../db";

export async function getUserProfile(id : string) {
  const user = await db.user.findUniqueOrThrow({
    where : {
      id
    },
    
  }).patient()
  return user
}