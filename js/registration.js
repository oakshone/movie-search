$(document).ready(function () {
  $("#registration-form").validate({ // jquery validation for form fields
    rules: {
      username: { required: true, minlength: 3 },
      email: { required: true, email: true },
      password: { required: true, minlength: 8 },
      confirm_password: { required: true, equalTo: "#password" },
    },
    messages: {
      username: {
        required: "Please enter a username",
        minlength: "At least 3 characters",
      },
      email: {
        required: "Please enter an email",
        email: "Enter a valid email",
      },
      password: {
        required: "Please enter a password",
        minlength: "At least 8 characters",
      },
      confirm_password: {
        required: "Please confirm your password",
        equalTo: "Passwords do not match",
      },
    },
  });
});
// Onclick eventListener
