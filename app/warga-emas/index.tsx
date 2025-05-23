import { storage } from '@/firebase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'; // adjust if path is different

const WargaEmasForm = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [icFront, setIcFront] = useState<string | null>(null);
  const [icBack, setIcBack] = useState<string | null>(null);
  const [imageFrontLocal, setImageFrontLocal] = useState<string | null>(null);
  const [imageBackLocal, setImageBackLocal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (side: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
  
      if (asset.base64) {
        const imageBase64 = `data:image/jpeg;base64,${asset.base64}`;
      
        if (side === 'front') {
          setIcFront(imageBase64);
          setImageFrontLocal(asset.uri); // ✅ Fix here
        } else {
          setIcBack(imageBase64);
          setImageBackLocal(asset.uri); // ✅ Fix here
        }
      }
       else {
        Alert.alert('Error', 'Failed to get base64 data from image.');
      }
    }
  };
  

  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const uploadImageAsync = async (uri: string, filename: string): Promise<string> => {
    const blob = await uriToBlob(uri);
    const imageRef = ref(storage, `warga-emas/${filename}`);
    await uploadBytes(imageRef, blob);
    const downloadUrl = await getDownloadURL(imageRef);
    return downloadUrl;
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !imageFrontLocal || !imageBackLocal) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    setLoading(true);
    try {
      console.log('Uploading front image...');
      const frontUrl = await uploadImageAsync(imageFrontLocal, `front-${Date.now()}.jpg`);
      console.log('Front image uploaded:', frontUrl);
  
      console.log('Uploading back image...');
      const backUrl = await uploadImageAsync(imageBackLocal, `back-${Date.now()}.jpg`);
      console.log('Back image uploaded:', backUrl);
  
      console.log('Sending email via Vercel API...');
      const response = await fetch('https://pharmacy-email-api.vercel.app/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'dylan.chua@globex.com.bn',
          subject: 'New Warga Emas Submission',
          messageHtml: `
            <h2>New Submission from Warga Emas Form</h2>
            <p><strong>Phone Number:</strong> ${phoneNumber}</p>
            <p><strong>IC Front:</strong><br><img src="${frontUrl}" width="300"/></p>
            <p><strong>IC Back:</strong><br><img src="${backUrl}" width="300"/></p>
          `,
        }),
      });
  
      console.log('Email response status:', response.status);
      if (response.ok) {
        Alert.alert('Submitted', 'Thank you for your submission!');
        setPhoneNumber('');
        setImageFrontLocal(null);
        setImageBackLocal(null);
      } else {
        const text = await response.text();
        console.error('Error response:', text);
        Alert.alert('Error', 'Submission failed.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={'#000'} />
        </TouchableOpacity>
        <Text style={styles.title}>Warga Emas Form</Text>
      </View>

      <Text style={styles.label}>No. Telefon</Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan nombor telefon"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <Text style={styles.label}>Muat Naik Gambar IC Depan</Text>
      <TouchableOpacity onPress={() => pickImage('front')} style={styles.imageUploadButton}>
        <Text style={styles.buttonText}>Pilih Gambar IC Depan</Text>
      </TouchableOpacity>
      {imageFrontLocal && <Image source={{ uri: imageFrontLocal }} style={styles.preview} />}

      <Text style={styles.label}>Muat Naik Gambar IC Belakang</Text>
      <TouchableOpacity onPress={() => pickImage('back')} style={styles.imageUploadButton}>
        <Text style={styles.buttonText}>Pilih Gambar IC Belakang</Text>
      </TouchableOpacity>
      {imageBackLocal && <Image source={{ uri: imageBackLocal }} style={styles.preview} />}

      <TouchableOpacity
  onPress={handleSubmit}
  style={[styles.submitButton, loading && { backgroundColor: '#ccc' }]}
  disabled={loading}
>
  {loading ? (
    <Text style={styles.submitButtonText}>Sedang Hantar...</Text>
  ) : (
    <Text style={styles.submitButtonText}>Hantar</Text>
  )}
</TouchableOpacity>

    </ScrollView>
  );
};

export default WargaEmasForm;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0484d5',
    flex: 1,
    textAlign: 'center',
    marginRight: 30,
  },
  label: {
    marginTop: 12,
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0484d5',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  imageUploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
