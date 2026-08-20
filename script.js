const helpOptions = [
    {
        value: "volunteer",
        title: "Volunteer",
        description: "Help with animal care, transportation, outreach, or adoption events.",
        nextStep: "We will follow up with volunteer opportunities that fit your availability."
    },
    {
        value: "foster",
        title: "Foster",
        description: "Provide a temporary, supportive home while an animal prepares for adoption.",
        nextStep: "We will share foster expectations and discuss what type of placement may fit your home."
    },
    {
        value: "adoption",
        title: "Adoption information",
        description: "Learn about adoption steps and how our team helps match pets with people.",
        nextStep: "We will send information about available animals and the adoption process."
    }
];

const experienceOptions = [
    { value: "none", label: "No prior experience" },
    { value: "some", label: "Some experience" },
    { value: "experienced", label: "Experienced pet caregiver" },
    { value: "professional", label: "Professional animal-care experience" }
];

const validationRules = {
    name: value => value.trim().length >= 2,
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    interest: value => value !== "",
    availability: value => value !== "",
    experience: value => value !== "",
    message: value => value.trim().length >= 10
};

const form = document.querySelector("#interest-form");

if (form) {
    const fields = {
        name: document.querySelector("#name"),
        email: document.querySelector("#email"),
        interest: document.querySelector("#interest"),
        availability: document.querySelector("#availability"),
        experience: document.querySelector("#experience"),
        message: document.querySelector("#message")
    };

    const storageKey = "twinCitiesRescueInterestForm";
    const summary = document.querySelector("#interest-summary");
    const submitMessage = document.querySelector("#form-success");

    function populateSelect(select, options) {
        const firstOption = select.querySelector('option');
        select.innerHTML = '';
        select.appendChild(firstOption);
        options.forEach(option => {
            const item = document.createElement('option');
            item.value = option.value;
            item.textContent = option.label || option.title;
            select.appendChild(item);
        });
    }

    function getFeedbackElement(field) {
        return document.querySelector(`#${field.id}-feedback`);
    }

    function setFeedback(field, message) {
        const feedback = getFeedbackElement(field);
        field.setAttribute("aria-invalid", message ? "true" : "false");
        feedback.textContent = message;
        feedback.hidden = !message;
    }

    function showInterestSummary(value) {
        const selected = helpOptions.find(option => option.value === value);

        if (!selected) {
            summary.hidden = true;
            summary.textContent = "";
            return;
        }

        summary.innerHTML = `<strong>${selected.title}</strong><span>${selected.description}</span><span>${selected.nextStep}</span>`;
        summary.hidden = false;
    }

    function collectFormData() {
        return Object.fromEntries(
            Object.entries(fields).map(([key, field]) => [key, field.value])
        );
    }

    function saveFormData() {
        localStorage.setItem(storageKey, JSON.stringify(collectFormData()));
    }

    function loadFormData() {
        const saved = localStorage.getItem(storageKey);
        if (!saved) return;

        try {
            const data = JSON.parse(saved);
            Object.entries(fields).forEach(([key, field]) => {
                if (typeof data[key] === "string") {
                    field.value = data[key];
                }
            });
            showInterestSummary(fields.interest.value);
        } catch (error) {
            localStorage.removeItem(storageKey);
        }
    }

    function validateField(name) {
        const field = fields[name];
        const value = field.value;
        let message = "";

        if (!value.trim() && ["name", "email", "interest", "availability", "experience", "message"].includes(name)) {
            message = "This field is required.";
        } else if (name === "name" && !validationRules.name(value)) {
            message = "Please enter at least 2 characters for your name.";
        } else if (name === "email" && !validationRules.email(value)) {
            message = "Please enter a valid email address.";
        } else if (name === "message" && !validationRules.message(value)) {
            message = "Please enter at least 10 characters in your message.";
        }

        setFeedback(field, message);
        return message === "";
    }

    function validateForm() {
        const results = Object.keys(fields).map(validateField);
        return results.every(Boolean);
    }

    function handleFieldInput(event) {
        validateField(event.target.name);
        saveFormData();

        if (event.target.name === "interest") {
            showInterestSummary(event.target.value);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        submitMessage.hidden = true;

        if (!validateForm()) {
            const firstInvalid = Object.values(fields).find(field => field.getAttribute("aria-invalid") === "true");
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        saveFormData();
        submitMessage.textContent = "Thank you! Your interest form has been saved, and our team can follow up with more information.";
        submitMessage.hidden = false;
    }

    populateSelect(fields.interest, helpOptions);
    populateSelect(fields.experience, experienceOptions);

    Object.values(fields).forEach(field => {
        field.addEventListener(field.tagName === "SELECT" ? "change" : "input", handleFieldInput);
    });

    form.addEventListener("submit", handleSubmit);
    loadFormData();
}
