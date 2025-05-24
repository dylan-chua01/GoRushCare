import axios from 'axios';
import React, { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

const ChatBaseScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await axios.post(
        'https://www.chatbase.co/api/v1/chat',
        {
          messages: [userMessage],
          chatbotId: 'n-miXqjuhoM3URyV-eEgN',
          stream: false,
        },
        {
          headers: {
            'Authorization': 'Bearer 1w9udp848veo41ue73wd11b70factxgf',
            'Content-Type': 'application/json',
          },
        }
      );

      const botMessage = {
        role: 'assistant',
        content: res.data.text,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Text style={item.role === 'user' ? styles.user : styles.bot}>
            {item.content}
          </Text>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  user: { alignSelf: 'flex-end', marginVertical: 4, backgroundColor: '#DCF8C6', padding: 8, borderRadius: 8 },
  bot: { alignSelf: 'flex-start', marginVertical: 4, backgroundColor: '#F1F0F0', padding: 8, borderRadius: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8 },
});

export default ChatBaseScreen;
