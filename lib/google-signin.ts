import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
});

export async function signInWithGoogle(): Promise<string> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (response.type !== "success") {
    throw new Error("Google sign-in was cancelled");
  }

  const idToken = response.data.idToken;

  if (!idToken) {
    throw new Error("No ID token received from Google Sign-In");
  }

  return idToken;
}

export async function signOutFromGoogle(): Promise<void> {
  const isSignedIn = GoogleSignin.hasPreviousSignIn();
  if (isSignedIn) {
    await GoogleSignin.signOut();
  }
}
