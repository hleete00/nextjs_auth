import CredentialProvider from "next-auth/providers/credentials";

import NextAuth from "next-auth";
import { connectToDatabase, userExists } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialProvider({
      name: "credentials",
      authorize: async (credentials) => {
        console.log("credentials= ", credentials);

        const client = await connectToDatabase();
        const db = client.db();
        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          throw new Error("No user found!");
        }
        console.log("user= ", user);

        console.log(credentials.password);
        console.log(user.password);
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        console.log("checked password");

        if (!isValid) {
          client.close();
          throw new Error("Invalid password! Try again!");
        }

        client.close();
        return { email: user.email };
      },
    }),
  ],
});
