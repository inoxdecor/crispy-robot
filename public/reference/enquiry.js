/* Delivery adapter for the supplied reference form. */
(() => {
  const form = document.querySelector("#f");
  const status = document.querySelector("#st");
  const submit = form.querySelector("[type=submit]");
  const serviceMap = {
    "Web development": "websites",
    "Mobile apps": "mobile-apps",
    "Software engineering": "custom-software",
    "AI and automation": "ai-automation",
    "E-commerce": "ecommerce",
    "Design and brand": "ui-ux-design",
    "Growth and support": "seo-support",
    "Not sure yet": "websites",
  };
  const fields = {
    name: "name",
    email: "email",
    service: "svc",
    message: "msg",
    consent: "consent",
    phone: "phone",
    company: "biz",
    budget: "budget",
    timeline: "time",
  };
  for (const [name, max] of Object.entries({
    name: 100,
    email: 254,
    phone: 40,
    biz: 160,
    msg: 5000,
    time: 120,
  }))
    form.elements[name].maxLength = max;
  for (const name of ["name", "email", "msg", "svc"])
    form.elements[name].required = true;
  for (const name of ["svc", "phone", "biz", "budget", "time"]) {
    const error = document.createElement("span");
    error.className = "err";
    error.dataset.e = name;
    form.elements[name].parentElement.append(error);
  }
  for (const name of Object.values(fields)) {
    const error = form.querySelector(`[data-e="${name}"]`);
    if (error) {
      error.id = `error-${name}`;
      form.elements[name].setAttribute("aria-describedby", error.id);
    }
  }
  const showErrors = (errors) => {
    form.querySelectorAll(".err").forEach((el) => (el.textContent = ""));
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((el) => el.removeAttribute("aria-invalid"));
    for (const [key, message] of Object.entries(errors)) {
      const name = fields[key] || key,
        error = form.querySelector(`[data-e="${name}"]`);
      if (error) error.textContent = message;
      form.elements[name]?.setAttribute("aria-invalid", "true");
    }
    form.querySelector("[aria-invalid=true]")?.focus();
  };
  let sending = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    const data = Object.fromEntries(new FormData(form));
    const errors = {};
    if (data.name.trim().length < 2) errors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
      errors.email = "Please enter a valid email address.";
    if (!data.svc) errors.service = "Please choose a service.";
    if (data.msg.trim().length < 20)
      errors.message =
        "Please describe your project in at least 20 characters.";
    if (!form.elements.consent.checked)
      errors.consent = "Please agree so we can respond.";
    if (data.website) {
      status.textContent =
        "We could not accept this submission. Please email us directly.";
      return;
    }
    showErrors(errors);
    if (Object.keys(errors).length) {
      status.textContent = "Please check the highlighted fields.";
      return;
    }
    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      company: data.biz.trim(),
      service: serviceMap[data.svc],
      budget: data.budget,
      message: data.msg.trim(),
      timeline: data.time.trim(),
      website: "",
      consent: form.elements.consent.checked,
    };
    sending = true;
    submit.disabled = true;
    submit.textContent = "Sending enquiry…";
    status.dataset.state = "sending";
    status.textContent = "Sending your enquiry…";
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) showErrors(result.errors);
        throw new Error(result.error || "Please check the highlighted fields.");
      }
      if (
        result.validated === true &&
        result.delivery?.provider === "web3forms" &&
        typeof result.delivery.accessKey === "string"
      ) {
        const message = `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "Not supplied"}\nBusiness: ${payload.company || "Not supplied"}\nService: ${data.svc}\nBudget: ${payload.budget || "Not supplied"}\nTimeline: ${payload.timeline || "Not supplied"}\n\n${payload.message}\n\nThe sender agreed to be contacted under the privacy policy.`;
        const delivered = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: result.delivery.accessKey,
            subject: "New project enquiry — TheBenzzCreations",
            from_name: "TheBenzzCreations",
            name: payload.name,
            email: payload.email,
            message,
            botcheck: "",
          }),
          signal: AbortSignal.timeout(15000),
        });
        const outcome = await delivered.json();
        if (!delivered.ok || outcome.success !== true)
          throw new Error("Delivery could not be confirmed.");
      } else if (result.success !== true)
        throw new Error("Delivery could not be confirmed.");
      window.dispatchEvent(new CustomEvent("benzz:lead-confirmed", { detail: { service: payload.service } }));
      form.reset();
      status.dataset.state = "success";
      status.textContent =
        "Your enquiry has been submitted. We’ll reply to the email address you provided.";
    } catch (error) {
      status.dataset.state = "error";
      status.textContent =
        (error.message || "We could not confirm delivery.") +
        " Please email thebenzzcreationsofficial@gmail.com or message us on WhatsApp.";
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = "Discuss your project";
      status.focus();
    }
  });
})();
