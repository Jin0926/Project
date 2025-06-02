import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Homescreen: React.FC = () => {
  const router = useRouter();

  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Separate modal states for logout and delete confirmation
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Form input states
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");

  // Editing state
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(
          "https://sampleapp-6afa9-default-rtdb.firebaseio.com/items.json"
        );
        const data = await res.json();

        const parsed = data
          ? Object.entries(data).map(([id, value]: [string, any]) => ({
              id,
              ...value,
            }))
          : [];

        setInventory(parsed);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Function to handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Filter inventory based on search query
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setName("");
    setQuantity("");
    setSize("");
    setColor("");
    setBrand("");
  };

  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleSaveItem = async () => {
    // Validate quantity to ensure it's a number
    if (!name || !quantity || isNaN(Number(quantity))) {
      Alert.alert("Validation Error", "Quantity must be a valid number.");
      return;
    }

    try {
      const newItem = {
        name,
        quantity: parseInt(quantity),
        size,
        color,
        brand,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch(
        "https://sampleapp-6afa9-default-rtdb.firebaseio.com/items.json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        }
      );

      if (!res.ok) throw new Error("Failed to add item.");

      const resData = await res.json(); // contains the new item's ID
      const id = resData.name;

      setInventory((prev) => [...prev, { id, ...newItem }]);

      setAddModalVisible(false);
      resetForm();
      Alert.alert("Success", "Item added successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add item.");
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
      if (!editingItem || isNaN(Number(quantity)) || !quantity) {
        Alert.alert("Validation Error", "Quantity must be a valid number.");
        return;
      }

      try {
        const updatedItem = {
          name,
          quantity: parseInt(quantity),
          size,
          color,
          brand,
        };

        const res = await fetch(
          `https://sampleapp-6afa9-default-rtdb.firebaseio.com/items/${editingItem.id}.json`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedItem),
          }
        );

        if (!res.ok) throw new Error("Failed to update item.");

        setInventory((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? { ...item, ...updatedItem } : item
          )
        );

        resetForm();
        setEditingItem(null);
        setEditModalVisible(false);
        Alert.alert("Success", "Item updated successfully!");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to update item.");
      }
    };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true); // Show delete confirmation modal
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(
        `https://sampleapp-6afa9-default-rtdb.firebaseio.com/items/${itemToDelete.id}.json`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete item.");

      setInventory((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      Alert.alert("Deleted", "Item removed successfully.");

      setDeleteConfirmVisible(false); // Hide the delete confirmation modal
      setItemToDelete(null); // Clear the item being deleted
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete item.");
    }
  };

  const handleLogout = () => {
    setLogoutConfirmVisible(true); // Show logout confirmation modal
  };

  const confirmLogout = () => {
    // Add your logout logic here (e.g., clearing token, signing out, etc.)
    setLogoutConfirmVisible(false);
    setTimeout(() => {
      router.replace("/"); // Redirect to login screen
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inventory</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search items"
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      {loading ? (
        <Text>Loading...</Text>
      ) : filteredInventory.length === 0 ? (
        <Text>No items found.</Text>
      ) : (
        filteredInventory.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>Quantity: {item.quantity}</Text>
            {item.size && <Text>Size: {item.size}</Text>}
            {item.color && <Text>Color: {item.color}</Text>}
            {item.brand && <Text>Brand: {item.brand}</Text>}

            <View style={styles.cardButtons}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons name="create-outline" size={24} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>+ Add Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#444" }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Item</Text>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Quantity" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} />
          <TextInput style={styles.input} placeholder="Size" value={size} onChangeText={setSize} />
          <TextInput style={styles.input} placeholder="Color" value={color} onChangeText={setColor} />
          <TextInput style={styles.input} placeholder="Brand" value={brand} onChangeText={setBrand} />
          <TouchableOpacity style={styles.button} onPress={handleSaveItem}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAddModalVisible(false)}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Edit Item</Text>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Quantity" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} />
          <TextInput style={styles.input} placeholder="Size" value={size} onChangeText={setSize} />
          <TextInput style={styles.input} placeholder="Color" value={color} onChangeText={setColor} />
          <TextInput style={styles.input} placeholder="Brand" value={brand} onChangeText={setBrand} />
          <TouchableOpacity style={styles.button} onPress={handleUpdateItem}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditModalVisible(false)}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteConfirmVisible} transparent animationType="fade">
        <View style={styles.confirmModal}>
          <Text style={styles.modalTitle}>Are you sure you want to delete this item?</Text>
          <TouchableOpacity style={styles.button} onPress={confirmDelete}>
            <Text style={styles.buttonText}>Yes, Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDeleteConfirmVisible(false)}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={logoutConfirmVisible} transparent animationType="fade">
        <View style={styles.confirmModal}>
          <Text style={styles.modalTitle}>Are you sure you want to log out?</Text>
          <TouchableOpacity style={styles.button} onPress={confirmLogout}>
            <Text style={styles.buttonText}>Yes, Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogoutConfirmVisible(false)}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardButtons: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancel: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },
  modal: {
    marginTop: 100,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  confirmModal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000000aa",
    padding: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
});

export default Homescreen;
