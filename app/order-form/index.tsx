import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const PharmacyForm = () => {
  const { control, handleSubmit, watch } = useForm();
  const pharmacy = watch("pharmacy");
  const district = watch("district");
  const districtOfResidence = watch("districtOfResidence");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);


  const healthCentres = {
    "Brunei Muara": [
      "Raja Isteri Pengiran Anak Saleha Hospital",
      "Pengkalan Batu Health Centre",
      "Jubli Perak Sengkurong Health Centre",
      "Jubli Emas Kg Perpindahan Bunut Health Centre",
      "Pengiran Anak Puteri Hajah Rashidah Sa'adatul Bolkiah Health Centre",
      "Pengiran Anak Puteri Hajah Muta-Wakillah Hayatul Bolkiah Health Centre",
      "Rimba Dialysis Centre",
      "Berakas Health Centre",
      "Muara Health Centre",
      "Psychiatry Department, Ministry of Health",
      "Kg Bolkiah",
      "Sg Bunga",
      "JPMC",
      "PJSC",
    ],
    Tutong: [
      "Pengiran Muda Mahkota Pengiran Muda Haji Al-Muhtadee Billah Hospital",
      "Telisai Health Centre",
      "Pekan Tutong Health Centre",
      "Sungai Kelugos Health Centre",
      "Lamunin Health Centre",
    ],
    Temburong: ["Pengiran Isteri Hajah Mariam Hospital", "Bangar Health Clinic"],
    Belait: [
      "Suri Seri Begawan Hospital",
      "Kuala Belait Health Centre",
      "Seria Health Centre",
      "Sungai Liang Health Centre",
    ],
  };

  const getDeliveryOptions = () => {
    if (pharmacy === "JPMC") {
      return [
        { label: "Express (Brunei-Muara) $5.50", value: "Express $5.50" },
        { label: "Standard (Brunei-Muara) $4", value: "Standard $4" },
        { label: "Self Collect $4", value: "Self Collect $4" }
      ];
    } else if (pharmacy === "Panaga") {
      return [
        { label: "Standard (Brunei-Muara) $7", value: "Standard $7" }
      ];
    } else if (pharmacy === "MOH" && district) {
      if (district === "Brunei Muara") {
        return [
          { label: "Immediate $20", value: "Immediate $20" },
          { label: "Express $5.50", value: "Express $5.50" },
          { label: "Standard $4", value: "Standard $4" },
          { label: "Self Collect $4", value: "Self Collect $4" }
        ];
      } else {
        return [
          { label: "Standard $4", value: "Standard $4" },
          { label: "Self Collect $4", value: "Self Collect $4" }
        ];
      }
    }
    return [];
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await sendEmailJS(data);
      setLoading(false);
      router.push("/thank-you");
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to send the form. Please try again.");
      console.log("Failed to submit", error);
    }
  };

  
  return (
    <><ScrollView style={[styles.container]}>


<View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
          <Ionicons name="chevron-back" size={28} color={'#bc1b2b'} />
        </TouchableOpacity>
        <Text style={styles.title}>Pharmacy Form</Text>
      </View>
      
      {/* Pharmacy Selection (Always shown) */}
      <Text style={styles.sectionHeader}>Pharmacy Information</Text>
        <FormLabel text="Pharmacy" />
        <Controller
          control={control}
          name="pharmacy"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
              <Picker.Item label="Select Pharmacy" value="" />
              <Picker.Item label="MOH" value="MOH" />
              <Picker.Item label="JPMC" value="JPMC" />
              <Picker.Item label="Panaga Health" value="Panaga" />
            </Picker>
          )}
        />

      {/* Pricing Information */}
      <TouchableOpacity 
          style={styles.pricingButton}
          onPress={() => setShowPricing(true)}
        >
          <Text style={styles.pricingButtonText}>View Pricing Information</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
      style={styles.wargaemasButton}
      onPress={() => Linking.openURL('https://www.gorushbn.com/warga-emas-form')}
    >
        <Text style={styles.wargaEmasButtonText}>Warga Emas</Text>
    </TouchableOpacity>

      {/* Only show the rest if pharmacy is selected */}
      {pharmacy && (
        <>
          {/* Personal Information Section */}
          <Text style={styles.sectionHeader}>Personal Information</Text>
          <FormLabel text="Full Name" />
          <FormInput name="fullName" control={control} placeholder="Your full name" />

          <FormLabel text="House / Unit No" />
          <FormInput name="houseNumber" control={control} placeholder="e.g. No. 23A" />

          <FormLabel text="Kampong" />
          <FormInput name="kampong" control={control} placeholder="e.g. Kg Rimba" />

          <FormLabel text="Jalan" />
          <FormInput name="jalan" control={control} placeholder="e.g. Jalan Gadong" />

          <FormLabel text="Simpang" />
          <FormInput name="simpang" control={control} placeholder="e.g. Simpang 45-12" />

          <FormLabel text="District of Residence" />
          <Controller
            control={control}
            name="districtOfResidence"
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
                <Picker.Item label="Select District" value="" />
                <Picker.Item label="Brunei Muara" value="Brunei Muara" />
                <Picker.Item label="Tutong" value="Tutong" />
                <Picker.Item label="Temburong" value="Temburong" />
                <Picker.Item label="Belait" value="Belait" />
              </Picker>
            )} />

          <FormLabel text="Postal Code" />
          <FormInput name="postalCode" control={control} placeholder="e.g. BE1318" />

          <FormLabel text="E-mail" />
          <FormInput
            name="email"
            control={control}
            placeholder="e.g. name@example.com"
            keyboardType="email-address" />

          <FormLabel text="Phone Number" />
          <FormInput
            name="phoneNumber"
            control={control}
            placeholder="e.g. +6731234567"
            keyboardType="phone-pad" />

          <FormLabel text="Additional Phone Number" />
          <FormInput
            name="additionalPhoneNumber"
            control={control}
            placeholder="Optional"
            keyboardType="phone-pad" />

          <FormLabel text="Patient Number / Bru-HIMs Number" />
          <FormInput name="patientNumber" control={control} />

          <FormLabel text="Date of Birth" />
          <FormInput name="dob" control={control} />

          <FormLabel text="IC or Passport" />
          <FormInput name="icOrPassport" control={control} />

          {pharmacy === "MOH" && (
            <>
              <FormLabel text="Appointment District" />
              <Controller
                control={control}
                name="district"
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
                    <Picker.Item label="Select District" value="" />
                    {Object.keys(healthCentres).map((d) => (
                      <Picker.Item key={d} label={d} value={d} />
                    ))}
                  </Picker>
                )} />
              {district && (
                <>
                  <FormLabel text="Health Centre" />
                  <Controller
                    control={control}
                    name="healthCentre"
                    defaultValue=""
                    render={({ field: { onChange, value } }) => (
                      <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
                        <Picker.Item label="Select Health Centre" value="" />
                        {healthCentres[district]?.map((hc) => (
                          <Picker.Item key={hc} label={hc} value={hc} />
                        ))}
                      </Picker>
                    )} />
                </>
              )}
              <FormLabel text="Paying Patient" />
              <FormPicker name="payingPatient" control={control} defaultValue="No" />
            </>
          )}

          {/* Delivery Options Section */}
          <Text style={styles.sectionHeader}>Delivery Options</Text>
          {(pharmacy === "JPMC" || pharmacy === "Panaga" || (pharmacy === "MOH" && district)) && (
            <>
              <FormLabel text="Delivery Option" />
              <Controller
                control={control}
                name="deliveryOption"
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
                    <Picker.Item label="Select Delivery Option" value="" />
                    {getDeliveryOptions().map((option) => (
                      <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                  </Picker>
                )} />
            </>
          )}

          {/* Payment Section */}
          <Text style={styles.sectionHeader}>Payment Information</Text>
          <FormLabel text="Payment Method" />
          <Controller
            control={control}
            name="paymentMethod"
            defaultValue="Cash"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
                <Picker.Item label="Cash" value="Cash" />
                <Picker.Item label="Bank Transfer (Baiduri)" value="Baiduri" />
                <Picker.Item label="Bill Payment (BIBD)" value="BIBD" />
              </Picker>
            )} />

          <FormLabel text="Remarks" />
          <FormInput name="remarks" control={control} />

          <Text style={styles.info}>
            For online payments, kindly make payment to the account number below and provide us the
            payment slip through WhatsApp: +6732332065
          </Text>
          <Text style={styles.info}>Go Rush BIBD via bill payment</Text>
          <Text style={styles.info}>Go Rush Express via Baiduri : 02-00-116-484129</Text>

          <View style={styles.submitBtn}>
            {loading ? (
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <ActivityIndicator size="large" color="#007bff" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit(onSubmit)}
              >
                <Text style={styles.submitButtonText}>Order Now</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
      // Pricing Modal
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPricing}
        onRequestClose={() => setShowPricing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalHeader}>Pharmacy Delivery Pricing</Text>

              {/* MOH Pricing */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>MOH Pricing</Text>

                {/* Brunei Muara */}
                <View style={styles.modalDistrict}>
                  <Text style={styles.modalDistrictTitle}>Brunei Muara</Text>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Immediate: <Text style={styles.modalPrice}>$20</Text></Text>
                    <Text style={styles.modalDescription}>(Within same day after medicine collected)</Text>
                  </View>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Express: <Text style={styles.modalPrice}>$5.50</Text></Text>
                    <Text style={styles.modalDescription}>(Next working day after medicine collected from pharmacy)</Text>
                  </View>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Standard: <Text style={styles.modalPrice}>$4.00</Text></Text>
                    <Text style={styles.modalDescription}>(2-3 Working days after medicine collected from pharmacy)</Text>
                  </View>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Self Collect: <Text style={styles.modalPrice}>$4.00</Text></Text>
                    <Text style={styles.modalDescription}>(Next working day)</Text>
                  </View>
                </View>

                {/* Tutong */}
                <View style={styles.modalDistrict}>
                  <Text style={styles.modalDistrictTitle}>Tutong</Text>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Standard: <Text style={styles.modalPrice}>$4.00</Text></Text>
                    <Text style={styles.modalDescription}>(2-3 Working days after medicine collected from pharmacy)</Text>
                  </View>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Self Collect: <Text style={styles.modalPrice}>$4.00</Text></Text>
                    <Text style={styles.modalDescription}>(Next working day)</Text>
                  </View>
                </View>

                {/* Temburong */}
                <View style={styles.modalDistrict}>
                  <Text style={styles.modalDistrictTitle}>Temburong</Text>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Standard: <Text style={styles.modalPrice}>$4.00</Text></Text>
                    <Text style={styles.modalDescription}>(2-3 Working days after medicine collected from pharmacy)</Text>
                  </View>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Self Collect: <Text style={styles.modalPrice}>$4.00</Text></Text>
                    <Text style={styles.modalDescription}>(Next working day)</Text>
                  </View>
                </View>

                {/* Belait */}
                <View style={styles.modalDistrict}>
                  <Text style={styles.modalDistrictTitle}>Temburong</Text>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Standard: <Text style={styles.modalPrice}>$4.00</Text></Text>
                    <Text style={styles.modalDescription}>(2-3 Working days after medicine collected from pharmacy)</Text>
                  </View>
                  <View style={styles.modalOption}>
                    <Text style={styles.modalOptionText}>• Self Collect: <Text style={styles.modalPrice}>$4.00</Text></Text>
                    <Text style={styles.modalDescription}>(Next working day)</Text>
                  </View>
                </View>
              </View>

              {/* JPMC Pricing */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>JPMC Pricing</Text>
                <View style={styles.modalOption}>
                  <Text style={styles.modalOptionText}>• Express: <Text style={styles.modalPrice}>$5.50</Text></Text>
                  <Text style={styles.modalDescription}>(Next Working Day)</Text>
                </View>
                <View style={styles.modalOption}>
                  <Text style={styles.modalOptionText}>• Standard: <Text style={styles.modalPrice}>$5.50</Text></Text>
                  <Text style={styles.modalDescription}>(2-3 Working days after medicine collected from pharmacy)</Text>
                </View>
                <View style={styles.modalOption}>
                  <Text style={styles.modalOptionText}>• Self Collect: <Text style={styles.modalPrice}>$5.50</Text></Text>
                  <Text style={styles.modalDescription}>(Next working day)</Text>
                </View>
              </View>

              {/* Panaga Pricing */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Panaga Health Pricing</Text>
                <View style={styles.modalOption}>
                  <Text style={styles.modalOptionText}>• Standard: <Text style={styles.modalPrice}>$7</Text></Text>
                  <Text style={styles.modalDescription}>(Same Day)</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPricing(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal></>

  );
};

const FormLabel = ({ text }: {text: string}) => <Text style={styles.label}>{text}</Text>;

const FormInput = ({ name, control, ...rest }: any) => (
  <Controller
    control={control}
    name={name}
    defaultValue=""
    render={({ field: { onChange, value } }) => (
      <TextInput
        style={styles.input}
        onChangeText={onChange}
        value={value}
        {...rest}
      />
    )}
  />
);


const FormPicker = ({ name, control, defaultValue = "No" }: any) => (
  <Controller
    control={control}
    name={name}
    defaultValue={defaultValue}
    render={({ field: { onChange, value } }) => (
      <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
        <Picker.Item label="No" value="No" />
        <Picker.Item label="Yes" value="Yes" />
      </Picker>
    )}
  />
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    height: "auto"
  },
  scrollContainer: {
    padding: 20,
  },
  backButton: {
    marginRight: 15,
},
headerTitle: {
  fontSize: 24,
  fontWeight: '700',
  color: 'white',
  marginLeft: 16,
},
title: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#0484d5",
  flex: 1,
  textAlign: "center",
  justifyContent: "center",
  marginRight: 40
},

  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#0484d5",
    borderBottomWidth: 1,
    borderBottomColor: "#0484d5",
    paddingBottom: 5
  },
  label: {
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#0484d5",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
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
  picker: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#0484d5",
    marginTop: 4,
    borderRadius: 8,
  },
  info: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },
  submitBtn: {
    marginTop: 20,
    marginBottom: 0,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#3498db',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pricingButton: {
    marginVertical: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    alignItems: 'center',
  },
  wargaemasButton: {
    marginVertical: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#AB47BC', // deep purple pink
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5, // Android shadow
  },
  pricingButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  wargaEmasButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalScrollView: {
    maxHeight: "85%",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2c3e50"
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: 10,
  },
  modalDistrict: {
    marginBottom: 15,
    marginLeft: 10,
  },
  modalDistrictTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  modalOption: {
    marginBottom: 8,
    marginLeft: 10,
  },
  modalOptionText: {
    fontSize: 15,
    color: "#34495e",
  },
  modalPrice: {
    fontWeight: "bold",
    color: "#e74c3c",
  },
  modalDescription: {
    fontSize: 13,
    color: "#7f8c8d",
    marginLeft: 15,
    fontStyle: "italic",
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#0484d5",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

function generateHtmlFromForm(data: any): string {
  return `
    <h2>Pharmacy Form Submission ${data.fullName}</h2>
    <h3>Personal Information</h3>
    <p><strong>Full Name:</strong> ${data.fullName}</p>
    <p><strong>House/Unit No:</strong> ${data.houseNumber}</p>
    <p><strong>Kampong:</strong> ${data.kampong}</p>
    <p><strong>Jalan:</strong> ${data.jalan}</p>
    <p><strong>Simpang:</strong> ${data.simpang}</p>
    <p><strong>District of Residence:</strong> ${data.districtOfResidence}</p>
    <p><strong>Postal Code:</strong> ${data.postalCode}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone Number:</strong> ${data.phoneNumber}</p>
    <p><strong>Additional Phone Number:</strong> ${data.additionalPhoneNumber || 'N/A'}</p>

    <h3>Pharmacy Information</h3>
    <p><strong>Pharmacy:</strong> ${data.pharmacy}</p>
    <p><strong>Patient Number:</strong> ${data.patientNumber}</p>
    <p><strong>Date of Birth:</strong> ${data.dob}</p>
    <p><strong>IC/Passport:</strong> ${data.icOrPassport}</p>
    ${data.district ? `<p><strong>Appointment District:</strong> ${data.district}</p>` : ''}
    ${data.healthCentre ? `<p><strong>Health Centre:</strong> ${data.healthCentre}</p>` : ''}
    <p><strong>Paying Patient:</strong> ${data.payingPatient || 'No'}</p>

    <h3>Delivery Information</h3>
    <p><strong>Delivery Option:</strong> ${data.deliveryOption || 'Not selected'}</p>

    <h3>Payment Information</h3>
    <p><strong>Payment Method:</strong> ${data.paymentMethod || 'Cash'}</p>
    <p><strong>Remarks:</strong> ${data.remarks || 'None'}</p>
  `;
}

async function sendEmailJS(data: any) {
  const response = await fetch("https://pharmacy-email-api.vercel.app/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: "dylan.chua@globex.com.bn",
      subject: `Pharmacy Form Submission: ${data.pharmacy}`,
      messageHtml: generateHtmlFromForm(data),
    }),
  });

  const text = await response.text();
  try {
    const json = JSON.parse(text);
    if (!response.ok) {
      throw new Error(json.error || "Unknown server error");
    }
    return json;
  } catch (err) {
    console.log("Server responded with non-JSON:", text);
    throw new Error("Invalid server response");
  }
}

export default PharmacyForm;