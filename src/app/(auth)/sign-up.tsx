import { useClerk, useSignUp } from "@clerk/expo";
import { Href, Link, router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const signup = () => {
  const { signUp, fetchStatus, errors } = useSignUp();
  const { setActive } = useClerk();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [userEmailOTP, setUserEmailOTP] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);

  const handleSubmitBtn = async () => {
    if (!signUp) return;

    const { error } = await signUp.password({
      emailAddress: email,
      password: pass,
    });

    if (error) {
      Alert.alert(error?.message || "Something Went Wrong");
      return;
    }

    const { error: updateError } = await signUp.update({
      firstName: firstName,
      lastName: lastName,
    });

    if (updateError) {
      Alert.alert(updateError?.message || "Could not save names");
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      Alert.alert(sendError?.message || "Could not send verification code");
      return;
    }
    setPendingVerification(true);
  };

  const handleVerify = async () => {
    if (!signUp) return;

    const { error } = await signUp.verifications.verifyEmailCode({
      code: userEmailOTP,
    });

    if (error) {
      Alert.alert(error?.message || "Wrong Code");
      return;
    }

    if (signUp.status === "complete" && setActive) {
      await setActive({ session: signUp.createdSessionId });
      router.replace("/");
    }
  };


  
  //signUp.status === "missing_requirements"
  //pendingVerification  
  //pendingVerification && signUp.status === "missing_requirements"  
  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Image
          source={require("../../../assets/images/logo-worldhousing-alpha.png")}
          style={styles.logo_img}
        />
        <TextInput
          style={[styles.TextInput, styles.full_width, { alignSelf: 'center' }]}
          placeholder="check your email for OTP"
          keyboardType="numeric"
          autoCapitalize="none"
          value={userEmailOTP}
          onChangeText={setUserEmailOTP}
        />
        <TouchableOpacity
          style={[styles.TextInput, styles.btn, styles.full_width]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={styles.btn_txt}>
            {fetchStatus === "fetching" ? "Verifying..." : "Verify OTP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            if (!signUp) return;
            const { error } = await signUp.verifications.sendEmailCode();
            if (error) {
              Alert.alert(error?.message || "Failed to resend code");
            } else {
              Alert.alert("Code resent successfully!");
            }
          }}
          style={styles.secondaryBtn}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={styles.secondaryBtnTxt}>Resend Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPendingVerification(false)}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnTxt}>Go Back / Edit Details</Text>
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

      <View style={styles.name_inp}>
        <TextInput
          style={[styles.TextInput, styles.half_width]}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={[styles.TextInput, styles.half_width]}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

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
        <Text style={styles.btn_txt}>
          {fetchStatus === "fetching" ? "Signing Up..." : "Sign-Up"}
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 20 }}>
        <Text>Already User? </Text>
        <Link href={"/sign-in"}>
          <Text style={{ color: "#00786c", fontWeight: "bold" }}>
            Sign-In Now!
          </Text>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default signup;

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
    fontFamily: "gilroy",
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
  secondaryBtn: {
    alignSelf: "center",
    marginTop: 20,
  },
  secondaryBtnTxt: {
    color: "#00786c",
    fontWeight: "bold",
  },
});
