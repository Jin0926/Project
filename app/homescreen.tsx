import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { Ionicons } from "@expo/vector-icons";
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";

const Home: React.FC = () => {
  const router = useRouter();

  // Modal visibility states
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Form input states
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");

  const [inventory, setInventory] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);

  //update
  const [items, setItems] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);



  const resetForm = () => {
    setName("");
    setQuantity("");
    setSize("");
    setColor("");
    setBrand("");
  };

    useEffect(() => {
    const db = getDatabase();
    const itemsRef = ref(db, "items");

    const unsubscribe = onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        setInventory(data || {});
        setLoading(false);
    });

    return () => unsubscribe();
    }, []);

    useEffect(() => {
    const db = getDatabase();
    const itemsRef = ref(db, "items");

    const unsubscribe = onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
        const parsedItems = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
        }));
        setItems(parsedItems);
        } else {
        setItems([]);
        }
    });

    return () => unsubscribe(); // cleanup listener
    }, []);


  const handleAdd = () => {
    setAddModalVisible(true);
  };

    const handleSaveItem = async () => {
    if (!name || !quantity) {
        Alert.alert("Validation Error", "Name and Quantity are required.");
        return;
    }

    try {
        const db = getDatabase();
        const itemsRef = ref(db, "items"); // path: /items/
        await push(itemsRef, {
        name,
        quantity: parseInt(quantity),
        size,
        color,
        brand,
        createdAt: new Date().toISOString(),
        });
        setAddModalVisible(false);
        resetForm();
        Alert.alert("Success", "Item added successfully!");
    } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to add item.");
    }
    };


  const confirmLogout = () => {
    setConfirmVisible(true);
  };

  const handleLogout = async () => {
    try {
      setConfirmVisible(false);
      await signOut(auth);
      setSuccessVisible(true);
      setTimeout(() => {
        setSuccessVisible(false);
        router.replace("/");
      }, 2000);
    } catch (error: any) {
      setConfirmVisible(false);
      alert(error.message || "Logout failed.");
    }
  };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setName(item.name);
        setQuantity(item.quantity.toString());
        setSize(item.size || "");
        setColor(item.color || "");
        setBrand(item.brand || "");
        setEditModalVisible(true);
    };

    const handleUpdateItem = async () => {
        if (!editingItem) return;

        try {
            const db = getDatabase();
            const itemRef = ref(db, `items/${editingItem.id}`);
            await update(itemRef, {
            name,
            quantity: parseInt(quantity),
            size,
            color,
            brand,
            });

            resetForm();
            setEditingItem(null);
            setEditModalVisible(false);
            Alert.alert("Success", "Item updated successfully!");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update item.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const db = getDatabase();
            await remove(ref(db, `items/${id}`));
            Alert.alert("Deleted", "Item removed successfully.");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete item.");
        }
    };
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAdd} style={styles.iconButton}>
          <Ionicons name="add-circle-outline" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>INVENTORY SYSTEM</Text>

        <TouchableOpacity onPress={confirmLogout} style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
            {items.length === 0 ? (
                <Text style={styles.emptyText}>Inventory is empty</Text>
            ) : (
                items.map((item) => (
                <View key={item.id} style={styles.itemBox}>
                    <Text style={styles.itemText}>Name: {item.name}</Text>
                    <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
                    {item.size ? <Text style={styles.itemText}>Size: {item.size}</Text> : null}
                    {item.color ? <Text style={styles.itemText}>Color: {item.color}</Text> : null}
                    {item.brand ? <Text style={styles.itemText}>Brand: {item.brand}</Text> : null}
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editIcon}>
                    <Ionicons name="create-outline" size={20} color="#007bff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteIcon}>
                        <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                </View>
                ))
            )}
        </ScrollView>




      {/* Add Item Modal */}
      <Modal
        transparent
        visible={addModalVisible}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Item</Text>

            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Size"
              value={size}
              onChangeText={setSize}
              style={styles.input}
            />
            <TextInput
              placeholder="Color"
              value={color}
              onChangeText={setColor}
              style={styles.input}
            />
            <TextInput
              placeholder="Brand"
              value={brand}
              onChangeText={setBrand}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleSaveItem} style={styles.modalButton}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
        >
        <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Update Item</Text>

            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.input}
            />
            <TextInput
                placeholder="Size"
                value={size}
                onChangeText={setSize}
                style={styles.input}
            />
            <TextInput
                placeholder="Color"
                value={color}
                onChangeText={setColor}
                style={styles.input}
            />
            <TextInput
                placeholder="Brand"
                value={brand}
                onChangeText={setBrand}
                style={styles.input}
            />

            <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleUpdateItem} style={styles.modalButton}>
                <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>


      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={confirmVisible}
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleLogout} style={styles.modalButton}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Success Modal */}
      <Modal
        transparent
        visible={successVisible}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: "#d4edda" }]}>
            <Text style={styles.modalMessage}>You have been logged out.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f4f4f4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  iconButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 45,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
  padding: 15,
  alignItems: "center",
},
card: {
  width: "100%",
  backgroundColor: "#f9f9f9",
  padding: 15,
  marginVertical: 10,
  borderRadius: 10,
  elevation: 3,
},
cardTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 5,
},
  itemBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  itemText: {
    fontSize: 16,
    marginBottom: 4,
  },
  editIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  deleteIcon: {
    position: "absolute",
    top: 10,
    right: 40,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },

});
