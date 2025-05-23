import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Divider, List } from 'react-native-paper';

const FAQScreen = () => {

    const router = useRouter()
  return (
    <ScrollView 
      style={[styles.container, {marginTop: 60}]}
      contentContainerStyle={styles.contentContainer}
    >
      <List.Section title="Frequently Asked Questions" titleStyle={styles.sectionTitle}>
        {/* Delivery Questions */}
        <List.Accordion
          title="🚚 Do you deliver from government clinics?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Yes. We pick up from MOH, JPMC/PJSC, or Panaga based on your appointment." 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        {/* Medication Issues */}
        <List.Accordion
          title="💊 Some medications are missing, what should I do?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Contact customer service at +6732332065 immediately." 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        {/* Payment Questions */}
        <List.Accordion
          title="💰 I'm a paying patient. Can you still deliver?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Yes. You'll be contacted about payment. Extra charges apply depending on the amount." 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
          <List.Item 
            title="MOH: Under BND$100 = we pay first; Over = you pay us first. +$2 or 3% fee applies." 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
          <List.Item 
            title="JPMC/PJSC: We can pay for you (+$2/3%), or you pay directly and send proof." 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        <List.Accordion
          title="❌ I got the wrong meds. What now?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Call our customer service at +6732332065 to assist." 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        {/* Delivery Options */}
        <List.Accordion
          title="📦 Difference between standard and express delivery?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Standard: 2–3 working days. Express: Next working day after release." 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        <List.Accordion
          title="🛑 I ordered twice by mistake. Can I cancel?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Yes, contact customer service at +6732332065 for cancellation." 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        <List.Accordion
          title="⚡ Express vs Immediate delivery?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Express = next day. Immediate = within 3 hours (before 3pm). Both for Brunei-Muara only." 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        {/* Payment Methods */}
        <List.Accordion
          title="💵 Can I pay cash for contactless delivery?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Yes. Prepare a basket/box for our dispatcher to drop off medicine and collect cash." 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        <List.Accordion
          title="🏦 What banks are available for bank transfer?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="BIBD and Baiduri only." 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        {/* Collection Options */}
        <List.Accordion
          title="🏃 Can I self-collect from your office?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Yes. Contact +6732332065 ahead of time." 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        <List.Accordion
          title="📍 What's your address?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="1st Floor, Block B, Bangunan Begawan Pehin Dato Hj Md Yusof, No 7, BSB BE1518" 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        {/* Payment Instructions */}
        <List.Accordion
          title="💳 How to pay using BIBD online?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Step 1: BIBD App → Payment Services → Bill Payment" 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
          <List.Item 
            title="Step 2: Select 'Go Rush Express'" 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
          <List.Item 
            title="Ref 1: Your Tracking No. | Ref 2: Your Phone No." 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        {/* Order Confirmation */}
        <List.Accordion
          title="✅ How do I know my order went through?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="You'll receive a WhatsApp with a tracking number. If no confirmation in 24 hrs, call us." 
            titleNumberOfLines={4}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        <List.Accordion
          title="🏦 I don't have BIBD. Can I use Baiduri?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Yes. Contact +6732332065 to get our Baiduri account number." 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
        </List.Accordion>
        <Divider style={styles.divider} />

        {/* Other Services */}
        <List.Accordion
          title="🚀 Do you offer other services?"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          <List.Item 
            title="Yes. Go Rush Plus and Local Delivery. Visit www.gorushbn.com." 
            titleNumberOfLines={3}
            style={styles.listItem}
          />
        </List.Accordion>
      </List.Section>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
  <Ionicons name="home-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
  <Text style={styles.buttonText}>Back to Home</Text>
</TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingVertical: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  accordion: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
  },
  accordionTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 16,
  },
  listItem: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
  divider: {
    backgroundColor: '#e0e0e0',
    height: 1,
    marginHorizontal: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default FAQScreen;