import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { Link, useRouter } from "expo-router";

const Index: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAL38RxF21hs7Kb6QzHMjFz2Nm7MI9Vcf0",
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
      if (!res.ok) throw new Error(data.error.message || "Login failed");

      console.log("✅ Login successful:", data.email);
      setModalMessage(`Welcome back, ${data.email}`);
      setIsSuccess(true);
      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(false);
        router.replace("/homescreen");
      }, 2000);
    } catch (error: any) {
      console.error("❌ Login error:", error.message);
      setModalMessage(error.message || "Unknown error occurred.");
      setIsSuccess(false);
      setModalVisible(true);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to Inventory System</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />

      <Link href="/signup" asChild>
        <Button title="Don't have an account? Sign Up" />
      </Link>

      {/* ✅ Modal Notification */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isSuccess ? styles.success : styles.error]}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            {!isSuccess && (
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Index;

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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  success: {
    backgroundColor: "#d4edda",
  },
  error: {
    backgroundColor: "#f8d7da",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  closeButton: {
    fontSize: 16,
    color: "#007bff",
    marginTop: 10,
  },
});
