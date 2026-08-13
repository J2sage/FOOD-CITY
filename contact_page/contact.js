import { showAlertModal  } from "../login.js";

const nameElement = document.getElementById('name');
const emailElement = document.getElementById('email');
const messageElement = document.getElementById('message');
const submitButton = document.getElementById('js-submit');

if(nameElement && emailElement && messageElement && submitButton){
  submitButton.addEventListener('click', (e)=>{
    if(nameElement.value !== '' && emailElement.value !== '' 
      && messageElement.value !== '')
    { 
      e.preventDefault();
      sendToMail(nameElement.value, emailElement.value, messageElement.value); 

      nameElement.value = '';
      emailElement.value = '';
      messageElement.value = '';
    } else {
      showAlertModal('Error', 'Please fill in all fields.', 'person-add-outline');
    }
  })
}

function sendToMail(name, email, messages){
  const recipent = 'jibrilbalogun15@gmail.com'; 

  let message = `Name: \n`;
  message+= `${name}\n`;
  message+=`------------`;
  message+= `Email\n`;
  message+= `${email}\n`;
  message+=`---------`;
  message+= `Message\n`;
  message+= `${messages}\n`;
  message+=`---------`;

  
  const encodedMessage = encodeURIComponent(message);
  const subject = encodeURIComponent("New Contact Form Submission");
  
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipent}&su=${subject}&body=${encodedMessage}`;

  window.open(gmailUrl, '_blank');
}