import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password"
import checkUser from "@/actions/getUserFromDB"

 
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "email"},
        password: { label: "password", type: "password"},
      },
      authorize: async (credentials) => {
        let user = null
 
        // logic to salt and hash password
        // const pwHash = saltAndHashPassword(credentials.password)
 
        // logic to verify if user exists
        user = await checkUser(credentials.email as string, credentials.password as string)
        console.log(user)
 
        if (!user) {
          // No user found, so this is their first attempt to login
          // meaning this is also the place you could do registration
          throw new Error("User not found.")
        }
 
        // return user object with the their profile data
        return user
      },
    }),
  ],
  // callbacks: {
  //   jwt({ token, user }) {
  //     if(user) token.role = user.email === "amministrazione@admin.it" ? "admin" : "user"
  //     return token
  //   },
  //   session({ session, token }) {
  //     session.user.role = token.email === "amministrazione@admin.it" ? "admin" : "user"
  //     return session
  //   }
  // }
  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      //@ts-ignore
      session.user.id = token.id
      return session
    },
  },
})