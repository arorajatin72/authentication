function submitForm() {
    // You can add your form submission logic here
    // For demonstration purposes, let's just log the form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Logging form data to the console
    console.log(`Name: ${name}\nEmail: ${email}\nMessage: ${message}`);
}
