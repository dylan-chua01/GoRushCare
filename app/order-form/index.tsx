import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const PharmacyForm = () => {
  const { control, handleSubmit, watch } = useForm();
  const pharmacy = watch("pharmacy");
  const district = watch("district");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await sendEmailJS(data);
      setLoading(false);
      navigation.navigate("ThankYouScreen"); // ✅ Redirect after success
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to send the form. Please try again.");
      console.log("Failed to submit", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pharmacy Form</Text>
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
  )}
/>

<FormLabel text="Postal Code" />
<FormInput name="postalCode" control={control} placeholder="e.g. BE1318" />

<FormLabel text="E-mail" />
<FormInput
  name="email"
  control={control}
  placeholder="e.g. name@example.com"
  keyboardType="email-address"
/>

<FormLabel text="Phone Number" />
<FormInput
  name="phoneNumber"
  control={control}
  placeholder="e.g. +6731234567"
  keyboardType="phone-pad"
/>

<FormLabel text="Additional Phone Number" />
<FormInput
  name="additionalPhoneNumber"
  control={control}
  placeholder="Optional"
  keyboardType="phone-pad"
/>
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

      <FormLabel text="Patient Number" />
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
            )}
          />
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
                )}
              />
            </>
          )}
          <FormLabel text="Paying Patient" />
          <FormPicker name="payingPatient" control={control} defaultValue="No" />
        </>
      )}

      {pharmacy === "JPMC" && (
        <>
          <Text style={styles.charges}>Charges: Express $5.50 | Standard $4 | Self Collect $4</Text>
          <FormLabel text="Paying Patient" />
          <FormPicker name="payingPatient" control={control} defaultValue="No" />
        </>
      )}

      {pharmacy === "Panaga" && <Text style={styles.charges}>Charges: Standard $7 (Same Day)</Text>}

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
        )}
      />

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
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <Button title="Submit" onPress={handleSubmit(onSubmit)} />
        )}
      </View>
    </ScrollView>
  );
};

const FormLabel = ({ text }) => <Text style={styles.label}>{text}</Text>;

const FormInput = ({ name, control, ...rest }) => (
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


const FormPicker = ({ name, control, defaultValue = "No" }) => (
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
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  picker: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 4,
    borderRadius: 8,
  },
  charges: {
    marginTop: 10,
    fontStyle: "italic",
    color: "#444",
  },
  info: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },
  submitBtn: {
    marginTop: 20,
    marginBottom: 30,
  },
});

// You already have this function
function generateHtmlFromForm(data: any): string {
  return `
    <h2>Pharmacy Form Submission</h2>
    <p><strong>Pharmacy:</strong> ${data.pharmacy}</p>
    <p><strong>Full Name:</strong> ${data.fullName}</p>
    <p><strong>House / Unit No:</strong> ${data.houseNumber}</p>
    <p><strong>Kampong:</strong> ${data.kampong}</p>
    <p><strong>Jalan:</strong> ${data.jalan}</p>
    <p><strong>Simpang:</strong> ${data.simpang}</p>
    <p><strong>District of Residence:</strong> ${data.districtOfResidence}</p>
    <p><strong>Postal Code:</strong> ${data.postalCode}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone Number:</strong> ${data.phoneNumber}</p>
    <p><strong>Additional Phone Number:</strong> ${data.additionalPhoneNumber}</p>
    <p><strong>Patient Number:</strong> ${data.patientNumber}</p>
    <p><strong>Date of Birth:</strong> ${data.dob}</p>
    <p><strong>IC or Passport:</strong> ${data.icOrPassport}</p>
    ${data.district ? `<p><strong>District:</strong> ${data.district}</p>` : ""}
    ${data.healthCentre ? `<p><strong>Health Centre:</strong> ${data.healthCentre}</p>` : ""}
    <p><strong>Paying Patient:</strong> ${data.payingPatient}</p>
    <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
    <p><strong>Remarks:</strong> ${data.remarks}</p>
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