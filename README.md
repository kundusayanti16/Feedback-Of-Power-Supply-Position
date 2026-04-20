# Feedback-Of-Power-Supply-Position
A feedback-based power supply simulation that iteratively adjusts output voltage using error correction until it stabilizes at the desired target.


# ⚡ Power Supply Feedback Simulation

**Live Demo:** *(Coming Soon)*

This project is an interactive simulation of a **feedback-based power supply system** that dynamically adjusts output voltage to match a desired target.

Instead of directly producing the result, the system starts from a random initial value and **iteratively corrects itself using feedback**, just like real-world control systems.

---

## ✨ Features

* Feedback-based voltage stabilization
* Random initial output for realistic simulation
* Step-by-step error correction
* Displays number of steps to reach stability
* Stores simulation history in database
* Clean and interactive user interface

---

## 🧠 How it works

The system follows a **discrete feedback loop**:

* Starts with a random output value
* Calculates error:
  `Error = Target - Current Output`
* Applies correction using gain
* Updates output accordingly

This process repeats until the output is **close enough to the target (within tolerance)**.

👉 This mimics real-world systems where results are achieved gradually rather than instantly.

---

## 🏗️ Project Structure

```bash
.
├── server.js                # Main Express server (API + simulation logic)
├── models/
│   └── Simulation.js        # Mongoose schema
├── public/
│   ├── index.html           # Frontend UI
│   ├── script.js            # Client-side logic
│   └── style.css            # Styling
├── package.json
├── package-lock.json
```

---

## ▶️ How to run

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
node server.js
```

Open in browser:

```
http://localhost:3000
```

---

## 🧪 Example Input

```
Input Voltage: 5  
Target Voltage: 10
```

---

## 📊 Output Includes

* Final Output Voltage
* Number of Steps
* System Status (Stable / Adjusting)

---

## 📡 API Endpoints

### ▶️ Run Simulation

**POST** `/api/simulate`

Request:

```json
{
  "inputVoltage": 5,
  "targetVoltage": 10
}
```

Response:

```json
{
  "finalOutput": 9.92,
  "steps": 12,
  "status": "Stable"
}
```

---

### 📜 Get History

**GET** `/api/history`

Returns the latest simulation records.

---

## 💡 Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)

---

## 🌍 Real-world Applications

* Voltage stabilizers
* Feedback control systems
* Industrial automation

---

## ⚡ Future Improvements

* Real-time graph visualization
* IoT integration
* Adaptive gain tuning

---

## 👥 Team

Developed as part of a project.

---

## ⭐ Support

If you found this project interesting, consider giving it a star!
