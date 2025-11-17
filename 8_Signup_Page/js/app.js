$(function () {
	var $form = $("#signupForm");
	var $success = $("#formSuccess");

	function setInvalid($input, message, $errorEl) {
		$input.addClass("invalid").attr("aria-invalid", "true");
		if ($errorEl && message) { $errorEl.text(message); }
	}

	function clearInvalid($input, $errorEl) {
		$input.removeClass("invalid").removeAttr("aria-invalid");
		if ($errorEl) { $errorEl.text(""); }
	}

	function isEmailValid(value) {
		var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
		return re.test(String(value).trim());
	}

	function isPhoneValid(value) {
		if (!value) return true; // optional
		var re = /^[+\d\s()\-]{7,20}$/;
		return re.test(String(value).trim());
	}

	function isPasswordStrong(value) {
		if (!value || value.length < 8) return false;
		var hasLower = /[a-z]/.test(value);
		var hasUpper = /[A-Z]/.test(value);
		var hasNumber = /\d/.test(value);
		var hasSymbol = /[^A-Za-z0-9]/.test(value);
		return hasLower && hasUpper && hasNumber && hasSymbol;
	}

	function validateFirstName() {
		var $input = $("#firstName");
		var value = $input.val();
		var $err = $("#firstNameError");
		if (!value || !value.trim()) {
			setInvalid($input, "First name is required.", $err);
			return false;
		}
		clearInvalid($input, $err);
		return true;
	}

	function validateLastName() {
		var $input = $("#lastName");
		var value = $input.val();
		var $err = $("#lastNameError");
		if (!value || !value.trim()) {
			setInvalid($input, "Last name is required.", $err);
			return false;
		}
		clearInvalid($input, $err);
		return true;
	}

	function validateEmail() {
		var $input = $("#email");
		var value = $input.val();
		var $err = $("#emailError");
		if (!value || !value.trim()) {
			setInvalid($input, "Email is required.", $err);
			return false;
		}
		if (!isEmailValid(value)) {
			setInvalid($input, "Please enter a valid email address.", $err);
			return false;
		}
		clearInvalid($input, $err);
		return true;
	}

	function validatePhone() {
		var $input = $("#phone");
		var value = $input.val();
		var $err = $("#phoneError");
		if (value && !isPhoneValid(value)) {
			setInvalid($input, "Please enter a valid phone number.", $err);
			return false;
		}
		clearInvalid($input, $err);
		return true;
	}

	function validatePassword() {
		var $input = $("#password");
		var value = $input.val();
		var $err = $("#passwordError");
		if (!value) {
			setInvalid($input, "Password is required.", $err);
			return false;
		}
		if (!isPasswordStrong(value)) {
			setInvalid($input, "Min 8 chars with upper, lower, number, symbol.", $err);
			return false;
		}
		clearInvalid($input, $err);
		return true;
	}

	function validateConfirmPassword() {
		var $input = $("#confirmPassword");
		var value = $input.val();
		var $err = $("#confirmPasswordError");
		var pass = $("#password").val();
		if (!value) {
			setInvalid($input, "Please confirm your password.", $err);
			return false;
		}
		if (value !== pass) {
			setInvalid($input, "Passwords do not match.", $err);
			return false;
		}
		clearInvalid($input, $err);
		return true;
	}

	function validateGender() {
		var $err = $("#genderError");
		var checked = $("input[name='gender']:checked").length > 0;
		if (!checked) {
			$err.text("Please select your gender.");
			return false;
		}
		$err.text("");
		return true;
	}

	function validateTerms() {
		var $checkbox = $("#terms");
		var $err = $("#termsError");
		if (!$checkbox.is(":checked")) {
			$err.text("You must agree to the terms.");
			return false;
		}
		$err.text("");
		return true;
	}

	// Live validations
	$("#firstName").on("blur input", validateFirstName);
	$("#lastName").on("blur input", validateLastName);
	$("#email").on("blur input", validateEmail);
	$("#phone").on("blur input", validatePhone);
	$("#password").on("blur input", function () {
		validatePassword();
		validateConfirmPassword();
	});
	$("#confirmPassword").on("blur input", validateConfirmPassword);
	$("input[name='gender']").on("change", validateGender);
	$("#terms").on("change", validateTerms);

	$form.on("submit", function (e) {
		e.preventDefault();

		var valid = true;
		valid = validateFirstName() && valid;
		valid = validateLastName() && valid;
		valid = validateEmail() && valid;
		valid = validatePhone() && valid;
		valid = validatePassword() && valid;
		valid = validateConfirmPassword() && valid;
		valid = validateGender() && valid;
		valid = validateTerms() && valid;

		if (!valid) {
			$success.attr("hidden", true).text("");
			// focus first invalid
			var $firstInvalid = $form.find(".invalid, [aria-invalid='true']").first();
			if ($firstInvalid.length) { $firstInvalid.trigger("focus"); }
			return;
		}

		// Success
		$success.text("Account created successfully!").removeAttr("hidden");
		$form[0].reset();
		$form.find(".invalid").removeClass("invalid").removeAttr("aria-invalid");
		$form.find(".error").text("");

		setTimeout(function () { $success.attr("hidden", true).text(""); }, 4000);
	});
});
