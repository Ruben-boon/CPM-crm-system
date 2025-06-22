import NextAuth, { Adapter } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongoDB";

export const authOptions = {
  baseUrl:
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    // This is the corrected signIn callback
    async signIn({ user, account }) {
      // This callback allows you to link accounts with the same email address.
      if (account?.provider && user.email) {
        const adapter = authOptions.adapter;
        const existingUser = await adapter.getUserByEmail(user.email);

        if (existingUser) {
          // A user with this email already exists.
          // Now, check if the new sign-in is from a provider that's already linked to this user.
          const userByAccount = await adapter.getUserByAccount({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          // If the provider is not linked yet, link it.
          if (!userByAccount) {
            await adapter.linkAccount({
              ...account,
              userId: existingUser.id,
            });
          }
        }
      }
      return true; // Continue with the sign-in process
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          userId: user.id,
        };
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // Note: You have a custom error page defined here.
    // The logs show a 404 for this page.
    // Make sure you have a page at /src/app/auth/error/page.tsx
    // or remove this line to use the default NextAuth error page.
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };