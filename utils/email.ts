import axios from "axios";

const sendEmailJS = async (formData: { pharmacy: any; patientNumber: any; dob: any; icOrPassport: any; district: any; healthCentre: any; payingPatient: any; paymentMethod: any; remarks: any; }) => {
  const serviceID = "service_jg8tulc";
  const templateID = "template_u2o7wnk";
  const publicKey = "uhKutJ97VAN8HC50z"; // Found in EmailJS dashboard

  const payload = {
    service_id: serviceID,
    template_id: templateID,
    user_id: publicKey,
    template_params: {
      pharmacy: formData.pharmacy,
      patient_number: formData.patientNumber || "",
      dob: formData.dob || "",
      ic_or_passport: formData.icOrPassport || "",
      district: formData.district || "",
      health_centre: formData.healthCentre || "",
      paying_patient: formData.payingPatient || "",
      payment_method: formData.paymentMethod || "",
      remarks: formData.remarks || "",
    },
  };

  try {
    const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", payload);
    return response;
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};
