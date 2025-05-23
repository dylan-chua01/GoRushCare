import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Footer = () => {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const callPhone = () => {
    Linking.openURL('tel:+6732332065').catch(err =>
      console.error("Couldn't make the call", err)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>© {new Date().getFullYear()} Go Rush. All rights reserved.</Text>
      <View style={styles.icons}>
        <TouchableOpacity onPress={() => openLink('https://www.instagram.com/gorush.bn/?hl=en')}>
          <Entypo name="instagram" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://wa.me/6732332065')}>
          <FontAwesome name="whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://www.facebook.com/go.rush.bwn/')}>
          <Entypo name="facebook" size={24} color="#4267B2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={callPhone}>
          <Ionicons name="call" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8ab4dc',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#1a1a1a',
    fontSize: 14,
    marginBottom: 8,
  },
  icons: {
    flexDirection: 'row',
    gap: 20,
  },
});

export default Footer;
