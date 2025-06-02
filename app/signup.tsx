import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useRouter } from "expo-router";

const Signup: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAL38RxF21hs7Kb6QzHMjFz2Nm7MI9Vcf0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Handle errors and display more user-friendly messages
        let errorMessage = "Signup failed.";
        if (data.error) {
          switch (data.error.message) {
            case "MISSING_EMAIL":
              errorMessage = "Email required";
              break;
            case "INVALID_EMAIL":
              errorMessage = "Please provide a valid email address";
              break;
            case "MISSING_PASSWORD":
              errorMessage = "Password required";
              break;
            case "WEAK_PASSWORD":
              errorMessage = "Password must be at least 6 characters";
              break;
            default:
              errorMessage = data.error.message;
              break;
          }
        }
        throw new Error(errorMessage);
      }

      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        router.replace("/"); // Redirect to login
      }, 3000);
    } catch (error: any) {
      alert(error.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? "Creating Account..." : "Sign Up"} onPress={handleSignup} disabled={loading} />

      {/* 🎉 Modal for success message */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>🎉 Congratulations!</Text>
            <Text>Your account has been created.</Text>
            <ActivityIndicator style={{ marginTop: 20 }} />
            <Text style={{ marginTop: 10 }}>Redirecting to login...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 45,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
