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
    } else {
      alert('Please fill in all fields');
    }
  })
}

function sendToMail(name, email, messages){
  const mail = 'jibrilbalogun15@gmail.com';

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
  
  window.location.href = `mailto:${mail}?subject=${subject}&body=${encodedMessage}`;
}