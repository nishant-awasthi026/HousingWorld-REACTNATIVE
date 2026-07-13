import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, Link, router } from "expo-router";
import { useSignIn } from "@clerk/expo";

const signin = () => {
  const { signIn, fetchStatus, errors } = useSignIn();

  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [userEmailOTP,setUserEmailOTP] = React.useState("");

  const handleSubmitBtn = async () => {
    const { error } = await signIn.password({
      emailAddress: email,
      password: pass,
    });

    // console.log(error);
    // console.log(error?.message || "Something Went Wrong");
    if (error) {
      Alert.alert(error?.message || "Something Went Wrong");
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          router.replace(decorateUrl("/") as Href);
        },
      });
    }
  };

  const mfa = async () => {
    const { error } = await signIn.mfa.verifyEmailCode({ code: userEmailOTP });
    if (error) {
      Alert.alert(error?.message || "Wrong Code");
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          router.replace(decorateUrl("/") as any);
        },
      });
    }
  };
  //signIn.status==="needs_client_trust"
  if (signIn.status==="needs_client_trust") {
    return (
      <SafeAreaView>
        <Image
          source={require("../../../assets/images/logo-worldhousing-alpha.png")}
          style={styles.logo_img}
        />
        {/* <Text
          style={{
            fontFamily: "gilroy",
            fontSize: 30,
            fontWeight: "bold",
            alignSelf: "center",
            paddingTop: 35,
          }}
        >
          Verify OTP
        </Text> */}
        <TextInput
          style={[styles.TextInput, styles.full_width,{alignSelf:'center'}]}
          placeholder="check your email for OTP"
          keyboardType="numeric"
          autoCapitalize="none"
          value={userEmailOTP}
          onChangeText={setUserEmailOTP}
        />
      <TouchableOpacity
        style={[styles.TextInput, styles.btn, styles.full_width]}
        onPress={mfa}
        disabled = {fetchStatus === "fetching"}
      >
      <Text style={styles.btn_txt}>{fetchStatus === "fetching"?"Verifying":"Verify OTP"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
          onPress={() => signIn.reset()}
          style={{ alignSelf: "center", marginTop: 5 }}
        >
          <Text style={{ color: "#00786c", fontWeight: "bold" }}>Start Over</Text>
        </TouchableOpacity>


      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image
        source={require("../../../assets/images/logo-worldhousing-alpha.png")}
        style={styles.logo_img}
      />

      {/* <View style={styles.name_inp}>
        <TextInput
          style={[styles.TextInput, styles.half_width]}
          placeholder="First Name"
        />
        <TextInput
          style={[styles.TextInput, styles.half_width]}
          placeholder="Last Name"
        />
      </View> */}

      <View style={styles.email_pass_wrapper}>
        <TextInput
          style={[styles.TextInput, styles.full_width]}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.TextInput, styles.full_width]}
          placeholder="Password"
          secureTextEntry={true}
          value={pass}
          onChangeText={setPass}
        />
      </View>

      <TouchableOpacity
        style={[styles.TextInput, styles.btn, styles.full_width]}
        onPress={handleSubmitBtn}
        disabled={fetchStatus === "fetching"}
      >
        <Text style={styles.btn_txt}>{fetchStatus === "fetching" ? "Signing In..." : "Sign-In"}</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignSelf: "center" }}>
        <Text>Fresh New User? </Text>
        <Link href={"/sign-up"}>
          <Text style={{ color: "#00786c", fontWeight: "bold" }}>
            Sign-Up Now!
          </Text>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default signin;

const styles = StyleSheet.create({
  logo_img: {
    height: 150,
    width: 250,
    resizeMode: "contain",
    margin: 17,
  },
  name_inp: {
    flexDirection: "row",
    // height: 50,
    width: "100%",
    justifyContent: "center",
  },
  TextInput: {
    borderWidth: 3,
    height: 50,
    borderRadius: 19,
    margin: 5,
    paddingHorizontal: 5,
    borderColor: "#00BFAD",
    // fontFamily: "gilroy",
    fontSize: 18,
  },
  email_pass_wrapper: {
    // height: 50,
    width: "100%",
    alignItems: "center",
    // marginVertical: 10,
  },
  full_width: { width: "92%" },
  half_width: { width: "45%" },
  btn: {
    alignSelf: "center",
    backgroundColor: "#00BFAD",
    marginTop: 30,
  },
  btn_txt: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    alignSelf: "center",
  },
});

// import { ThemedText } from '@/components/themed-text'
// import { ThemedView } from '@/components/themed-view'
// import { useSignIn } from '@clerk/expo'
// import { type Href, Link, useRouter } from 'expo-router'
// import React from 'react'
// import { Pressable, StyleSheet, TextInput, View } from 'react-native'

// export default function Page() {
//   const { signIn, errors, fetchStatus } = useSignIn()
//   const router = useRouter()

//   const [emailAddress, setEmailAddress] = React.useState('')
//   const [password, setPassword] = React.useState('')
//   const [code, setCode] = React.useState('')

//   const handleSubmit = async () => {
//     const { error } = await signIn.password({
//       emailAddress,
//       password,
//     })
//     if (error) {
//       console.error(JSON.stringify(error, null, 2))
//       return
//     }

//     if (signIn.status === 'complete') {
//       await signIn.finalize({
//         navigate: ({ session, decorateUrl }) => {
//           if (session?.currentTask) {
//             // Handle pending session tasks
//             // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
//             console.log(session?.currentTask)
//             return
//           }

//           const url = decorateUrl('/')
//           if (url.startsWith('http')) {
//             window.location.href = url
//           } else {
//             router.push(url as Href)
//           }
//         },
//       })
//     } else if (signIn.status === 'needs_second_factor') {
//       // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
//     } else if (signIn.status === 'needs_client_trust') {
//       // For other second factor strategies,
//       // see https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
//       const emailCodeFactor = signIn.supportedSecondFactors.find(
//         (factor) => factor.strategy === 'email_code',
//       )

//       if (emailCodeFactor) {
//         await signIn.mfa.sendEmailCode()
//       }
//     } else {
//       // Check why the sign-in is not complete
//       console.error('Sign-in attempt not complete:', signIn)
//     }
//   }

//   const handleVerify = async () => {
//     await signIn.mfa.verifyEmailCode({ code })

//     if (signIn.status === 'complete') {
//       await signIn.finalize({
//         navigate: ({ session, decorateUrl }) => {
//           if (session?.currentTask) {
//             // Handle pending session tasks
//             // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
//             console.log(session?.currentTask)
//             return
//           }

//           const url = decorateUrl('/')
//           if (url.startsWith('http')) {
//             window.location.href = url
//           } else {
//             router.push(url as Href)
//           }
//         },
//       })
//     } else {
//       // Check why the sign-in is not complete
//       console.error('Sign-in attempt not complete:', signIn)
//     }
//   }

//   if (signIn.status === 'needs_client_trust') {
//     return (
//       <ThemedView style={styles.container}>
//         <ThemedText type="title" style={[styles.title, { fontSize: 24, fontWeight: 'bold' }]}>
//           Verify your account
//         </ThemedText>
//         <TextInput
//           style={styles.input}
//           value={code}
//           placeholder="Enter your verification code"
//           placeholderTextColor="#666666"
//           onChangeText={(code) => setCode(code)}
//           keyboardType="numeric"
//         />
//         {errors.fields.code && (
//           <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
//         )}
//         <Pressable
//           style={({ pressed }) => [
//             styles.button,
//             fetchStatus === 'fetching' && styles.buttonDisabled,
//             pressed && styles.buttonPressed,
//           ]}
//           onPress={handleVerify}
//           disabled={fetchStatus === 'fetching'}
//         >
//           <ThemedText style={styles.buttonText}>Verify</ThemedText>
//         </Pressable>
//         <Pressable
//           style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
//           onPress={() => signIn.mfa.sendEmailCode()}
//         >
//           <ThemedText style={styles.secondaryButtonText}>I need a new code</ThemedText>
//         </Pressable>
//         <Pressable
//           style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
//           onPress={() => signIn.reset()}
//         >
//           <ThemedText style={styles.secondaryButtonText}>Start over</ThemedText>
//         </Pressable>
//       </ThemedView>
//     )
//   }

//   return (
//     <ThemedView style={styles.container}>
//       <ThemedText type="title" style={styles.title}>
//         Sign in
//       </ThemedText>

//       <ThemedText style={styles.label}>Email address</ThemedText>
//       <TextInput
//         style={styles.input}
//         autoCapitalize="none"
//         value={emailAddress}
//         placeholder="Enter email"
//         placeholderTextColor="#666666"
//         onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
//         keyboardType="email-address"
//       />
//       {errors.fields.identifier && (
//         <ThemedText style={styles.error}>{errors.fields.identifier.message}</ThemedText>
//       )}
//       <ThemedText style={styles.label}>Password</ThemedText>
//       <TextInput
//         style={styles.input}
//         value={password}
//         placeholder="Enter password"
//         placeholderTextColor="#666666"
//         secureTextEntry={true}
//         onChangeText={(password) => setPassword(password)}
//       />
//       {errors.fields.password && (
//         <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
//       )}
//       <Pressable
//         style={({ pressed }) => [
//           styles.button,
//           (!emailAddress || !password || fetchStatus === 'fetching') && styles.buttonDisabled,
//           pressed && styles.buttonPressed,
//         ]}
//         onPress={handleSubmit}
//         disabled={!emailAddress || !password || fetchStatus === 'fetching'}
//       >
//         <ThemedText style={styles.buttonText}>Continue</ThemedText>
//       </Pressable>
//       {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
//       {errors && <ThemedText style={styles.debug}>{JSON.stringify(errors, null, 2)}</ThemedText>}

//       <View style={styles.linkContainer}>
//         <ThemedText>Don't have an account? </ThemedText>
//         <Link href="/sign-up">
//           <ThemedText type="link">Sign up</ThemedText>
//         </Link>
//       </View>
//     </ThemedView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     gap: 12,
//   },
//   title: {
//     marginBottom: 8,
//   },
//   label: {
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: '#0a7ea4',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   buttonPressed: {
//     opacity: 0.7,
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   secondaryButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   secondaryButtonText: {
//     color: '#0a7ea4',
//     fontWeight: '600',
//   },
//   linkContainer: {
//     flexDirection: 'row',
//     gap: 4,
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   error: {
//     color: '#d32f2f',
//     fontSize: 12,
//     marginTop: -8,
//   },
//   debug: {
//     fontSize: 10,
//     opacity: 0.5,
//     marginTop: 8,
//   },
// })
