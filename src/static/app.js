document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Main card content
        activityCard.innerHTML = `
          <h4></h4>
          <p></p>
          <p><strong>Schedule:</strong> <span class="schedule"></span></p>
          <p><strong>Availability:</strong> <span class="availability"></span></p>
        `;

        // Fill the main content safely
        activityCard.querySelector("h4").textContent = name;
        activityCard.querySelector("p").textContent = details.description;
        activityCard.querySelector(".schedule").textContent = details.schedule;
        activityCard.querySelector(".availability").textContent = `${spotsLeft} spots left`;

        // Participants section
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        participantsDiv.appendChild(participantsHeading);

        const ul = document.createElement("ul");
        if (!details.participants || details.participants.length === 0) {
          const li = document.createElement("li");
          li.className = "no-participants";
          li.textContent = "No participants yet";
          ul.appendChild(li);
        } else {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.textContent = p;
            ul.appendChild(li);
          });
        }
        participantsDiv.appendChild(ul);

        activitiesList.appendChild(activityCard);
        activityCard.appendChild(participantsDiv);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
