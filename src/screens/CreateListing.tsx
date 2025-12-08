import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';

import Ionicons from "react-native-vector-icons/Ionicons";

const CreateListing = () => {
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [age, setAge] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handlePostListing = () => {
    console.log({ petName, petType, age, price, description });
    // TODO: Handle API upload logic here
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#f1641e" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Listing</Text>
        <Text style={styles.subtitle}>List your pet for adoption or sale</Text>
      </View>

      {/* Form Section */}
      <View style={styles.form}>
        {/* Image Upload Placeholder */}
        <TouchableOpacity style={styles.imageUpload}>
          <Ionicons name="camera-outline" size={40} color="#f1641e" />
          <Text style={styles.imageUploadText}>Upload Pet Image</Text>
        </TouchableOpacity>

        {/* Pet Name */}
        <View style={styles.inputContainer}>
          <Ionicons name="paw-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Pet Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={petName}
            onChangeText={setPetName}
          />
        </View>

        {/* Pet Type */}
        <View style={styles.inputContainer}>
          <Ionicons name="list-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Pet Type (e.g. Dog, Cat, Bird)"
            placeholderTextColor="#888"
            style={styles.input}
            value={petType}
            onChangeText={setPetType}
          />
        </View>

        {/* Age */}
        <View style={styles.inputContainer}>
          <Ionicons name="hourglass-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Age (in months or years)"
            placeholderTextColor="#888"
            style={styles.input}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Price */}
        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Price (PKR)"
            placeholderTextColor="#888"
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Description */}
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <Ionicons name="document-text-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Description"
            placeholderTextColor="#888"
            style={[styles.input, styles.textArea]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Post Button */}
        <TouchableOpacity style={styles.postButton} onPress={handlePostListing}>
          <Ionicons name="send-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.postButtonText}>Post Listing</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateListing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f1641e',
    paddingVertical: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 6,
  },
  form: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  imageUpload: {
    borderWidth: 2,
    borderColor: '#f1641e',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    backgroundColor: '#fff7f3',
  },
  imageUploadText: {
    marginTop: 8,
    color: '#f1641e',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: '#f1641e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
