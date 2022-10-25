import { getSession } from "next-auth/react";
import { hashPassword, verifyPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

async function handler(request, response) {
  if (request.method !== "PATCH") {
    return;
  }

  const session = await getSession({ req: request });

  if (!session) {
    response.status(401).json({ message: "Not authenticated" });
    return;
  }

  const userEmail = session.user.email;
  const oldPassword = request.body.oldPassword;
  const newPassword = request.body.newPassword;

  const client = await connectToDatabase();
  const usersCollection = client.db().collection("users");
  const user = await usersCollection.findOne({ email: userEmail });

  if (!user) {
    response.status(404).json({ message: "User not found" });
    client.close();
    return;
  }

  const currentPassword = user.password;

  const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword);

  if (!passwordsAreEqual) {
    response.status(403).json({ message: "Invalid password." });
    client.close();
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  const result = await usersCollection.updateOne(
    { email: userEmail },
    { $set: { password: hashedPassword } }
  );

  client.close();
  response.status(200).json({ message: "Password updated" });
}
